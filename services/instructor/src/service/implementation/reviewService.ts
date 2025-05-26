import {
    BadRequestError,
    ConflictError,
    IReveiewCategory,
    IStudent,
    IUser,
    IWeek,
    JwtPayloadType,
} from "@codeflare/common";
import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../../repository/interface/IReviewRepository";
import { IReviewService } from "../interface/IReviewService";
import { getUser, getUsers, updateUser } from "../../grpc/client/userClient";
import { ObjectId } from "mongoose";
import { getAllWeeks, getCachedWeek } from "../../utils/cachedWeek";
import { getCachedDomain } from "../../utils/cachedDomain";
import { getAvailableInstructor } from "../../utils/availableInstructor";

/** Implementation of Review Service */
export class ReviewService implements IReviewService {
    private reviewRepository: IReviewRepository;

    /**
     * Constructs an instance of the ReviewService.
     * @param reviewRepository - The repository used for managing review data.
     */
    constructor(reviewRepository: IReviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    /**
     * Retrieves scheduled reviews for a user.
     * @param userId - The ID of the user whose scheduled reviews are to be retrieved.
     * @returns A promise that resolves to an array of review DTOs containing detailed review information
     *          along with associated user data.
     * @throws An error if there is a problem retrieving the reviews or user information.
     */
    async getScheduledReviews(userId: string): Promise<IReviewDto[]> {
        try {
            const reviews = await this.reviewRepository.findReviewsWithLimit(userId);

            if (!reviews || !reviews.length) return [];

            const studentIds = []; // studentIds

            for (let i = 0; i < reviews.length; i++) {
                studentIds.push(
                    ...[
                        reviews[i].studentId as unknown as string,
                        reviews[i].instructorId as unknown as string,
                    ]
                );
            }

            // Users info through gRPC
            let usersMap: Record<string, IUser | IStudent>;

            const resp = await getUsers([...new Set(studentIds)], "");

            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            }

            // Reviews detils with user info
            return Promise.all(
                reviews.map(async (review) => ({
                    _id: review._id as unknown as string,
                    student: usersMap[
                        review.studentId as unknown as string
                    ] as unknown as IStudent,
                    instructor: usersMap[
                        review.instructorId as unknown as string
                    ] as unknown as IUser,
                    title: review.title,
                    week: (await getCachedWeek(review.weekId)) as IWeek,
                    date: review.date,
                    time: review.time,
                    category: review.category as IReveiewCategory,
                    score: review.score,
                    result: review.result,
                    status: review.status,
                    pendings: review.pendings,
                    feedback: review.feedback,
                    rating: review.rating,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                }))
            );
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Schedules a review for a user.
     * @param tokenPayload - The JWT token payload containing user identification information.
     * @param data - The data used to schedule a review.
     * @returns A promise that resolves to a review DTO.
     * @throws An error if there is a problem scheduling the review.
     */
    async scheduleReview(
        tokenPayload: string,
        data: Partial<IReviewSchema>
    ): Promise<Partial<IReviewDto>> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Instutructor id
            const instructorId = _id as unknown as ObjectId;

            // Find the latest review of a user for a perticular week
            const isReviewExists = await this.reviewRepository.findReviewsWithLimit(
                data.studentId as unknown as string,
                data.weekId as unknown as string,
                1
            );

            // Check latest review status is pending or completed
            if (
                isReviewExists &&
                isReviewExists.length > 0 &&
                (isReviewExists[0].status === "Pending" ||
                    (isReviewExists[0].status === "Completed" &&
                        isReviewExists[0].result !== "Fail"))
            )
                throw new ConflictError(
                    isReviewExists?.[0].status === "Pending"
                        ? isReviewExists[0].instructorId == instructorId
                            ? "Review already scheduled for this student !"
                            : "Review already scheduled by another instructor !"
                        : isReviewExists[0].instructorId == instructorId
                            ? "Review already completed. please update score !"
                            : "Review already completed by another instructor !"
                );

            // User and instrucor details through gRPC
            let student;
            let instructor;

            const resp1Promise = getUser(data.studentId as unknown as string);
            const resp2Promise = getUser(instructorId as unknown as string);

            const [resp1, resp2] = await Promise.all([resp1Promise, resp2Promise]);

            if (
                resp1 &&
                resp2 &&
                resp1.response.status === 200 &&
                resp2.response.status === 200
            ) {
                student = resp1.response.user;
                instructor = resp2.response.user;
            } else {
                throw new Error("Failed to schedule review!");
            }

            // Review data
            const reviewData = {
                ...data,
                instructorId,
            };

            // Remove weekId if it's empty
            if (!reviewData.weekId) {
                delete reviewData.weekId;
            }

            // Create review
            const review = await this.reviewRepository.create(reviewData);

            if (!review) throw new Error("Failed to schedule review!");

            // Map data to reutrn type
            const reviewDto: Partial<IReviewDto> = {
                _id: review._id as unknown as string,
                student: student as unknown as IStudent,
                instructor: instructor as unknown as IUser,
                title: review.title,
                week: (await getCachedWeek(review.weekId)) as IWeek,
                date: review.date,
                time: review.time,
                status: review.status,
                result: review.result,
                feedback: review.feedback,
                score: review.score,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt,
            };

            return reviewDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates a review for a user.
     * @param tokenPayload - The JWT token payload containing user identification information.
     * @param data - The review data to be updated.
     * @param reviewId - The ID of the review to be updated.
     * @returns A promise that resolves to an updated review DTO with user information.
     * @throws An error if there is a problem updating the review.
     */
    async updateReview(
        tokenPayload: string,
        data: Partial<IReviewSchema>,
        reviewId: string
    ): Promise<IReviewDto> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Instutructor id
            const instructorId = _id as unknown as ObjectId;

            // Find review
            const review = await this.reviewRepository.findOne({ _id: reviewId });

            if (!review) throw new Error("Review not found");

            // Cheak weather instructor is authorized
            if (instructorId != review.instructorId)
                throw new Error("You are restricted to update this review !");

            // If date and time updates
            if (data.date || data.time) {
                // Find the latest review of the user
                let latestReview = await this.reviewRepository.findReviewsWithLimit(
                    review.studentId as unknown as string,
                    "",
                    1
                );

                if (!latestReview) throw new Error("Failed to update review !");

                // Check weather, we are updating the latest review of a user
                if (latestReview[0]._id != reviewId)
                    throw new Error("You can't update previous review details !");
            }

            // User info through gRPC
            let user;
            let instructor;

            const resp1 = await getUser(review.studentId as unknown as string);
            const resp2 = await getUser(instructorId as unknown as string);

            if (
                resp1 &&
                resp2 &&
                resp1.response.status === 200 &&
                resp2.response.status === 200
            ) {
                user = resp1.response.user;
                instructor = resp2.response.user;
            } else {
                throw new Error("Failed to update review!");
            }

            // Update review
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: data },
                { new: true }
            );

            if (!updatedReview) throw new Error("Failed to update review !");

            // Map data to return type
            const reviewDto: IReviewDto = {
                _id: updatedReview._id as unknown as string,
                student: user as unknown as IStudent,
                instructor: instructor as unknown as IUser,
                title: updatedReview.title,
                week: (await getCachedWeek(updatedReview.weekId)) as IWeek,
                date: updatedReview.date,
                time: updatedReview.time,
                category: updatedReview.category as IReveiewCategory,
                rating: updatedReview.rating,
                feedback: updatedReview.feedback,
                pendings: updatedReview.pendings,
                score: updatedReview.score,
                status: updatedReview.status,
                result: updatedReview.result,
                createdAt: updatedReview.createdAt,
                updatedAt: updatedReview.updatedAt,
            };
            return reviewDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Changes the status of a review with the given id.
     * @param tokenPayload - The JSON web token payload containing the user id.
     * @param reviewId - The id of the review to be updated.
     * @param status - The new status of the review.
     * @returns A promise that resolves if the review status is updated successfully, otherwise rejects with an error.
     * @throws An error if there is a problem updating the review status.
     */
    async changeStatus(
        tokenPayload: string,
        reviewId: string,
        status: string
    ): Promise<{ _id: string } | null> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Instutructor id
            const instructorId = _id as unknown as ObjectId;

            // Find review
            const review = await this.reviewRepository.findOne({ _id: reviewId });

            if (!review) throw new Error("Review not found");

            // Cheak weather instructor is authorized
            if (instructorId != review.instructorId)
                throw new Error("You are restricted to update this review !");

            // Find the latest review of the user
            let latestReview = await this.reviewRepository.findReviewsWithLimit(
                review.studentId as unknown as string,
                "",
                1
            );

            if (!latestReview) throw new Error("Failed to update status !");

            // Check weather, we are updating the latest review of a user
            if (latestReview[0].time && latestReview[0]._id != reviewId)
                throw new Error("You can't update previous review status !");

            // Find the last two reviews of the user of same week
            // let reviews = await this.reviewRepository.findReviewsWithLimit(
            //     review.studentId as unknown as string,
            //     review.weekId as unknown as string,
            //     2
            // );

            // if (!reviews) throw new Error("Failed to update status !");

            // let flag = false;

            // Check weather, status of previous review of same week is Absent
            // if (
            //     reviews.length >= 2 &&
            //     reviews[1].status === "Absent" &&
            //     status === "Absent"
            // ) {
            //     flag = true;
            // }

            // // Update user through gRPC
            // const { response } = await updateUser(
            //     review.studentId as unknown as string,
            //     {
            //         stage: flag ? "Intake" : "Normal",
            //         week: review.weekId, // Old week
            //     }
            // );

            // if (response.status !== 200) throw new Error("Failed to update status !");

            // Update user's week thorugh gRPC
            // If status is no completed

            let reviewToDelete;

            if (status !== "Completed") {
                let previousWeek;

                if (review.weekId) {
                    previousWeek = review.weekId;
                } else {
                    previousWeek = null;
                }

                // Update user (student)
                const resp = await updateUser(review.studentId as unknown as string, {
                    week: previousWeek,
                });

                if (resp && resp.response.status !== 200)
                    throw new Error("Failed to update score !");

                // Find the latest review of student
                const latestReview = await this.reviewRepository.findReviewsWithLimit(
                    review.studentId as unknown as string,
                    "",
                    1
                );

                // Delete the latest scheduled review (new review - not the review which we are updating now)
                if (
                    latestReview &&
                    latestReview.length > 0 &&
                    latestReview[0]._id != reviewId
                ) {
                    reviewToDelete = latestReview[0];
                    await this.reviewRepository.delete({ _id: latestReview[0]._id });
                }
            }

            // Update review status
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                {
                    $set: {
                        status: status,
                        ...(status !== "Completed" && { result: null, score: null }),
                    },
                }
            );

            if (!updatedReview) throw new Error("Failed to update status !");

            // Return id of deleted review
            if (reviewToDelete) {
                return { _id: reviewToDelete._id as unknown as string };
            } else {
                return null;
            }
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the score of a review with the given id.
     * @param tokenPayload - The JSON web token payload containing the instructor id.
     * @param reviewId - The id of the review to update.
     * @param practical - The practical score to be updated for the review.
     * @param theory - The theory score to be updated for the review.
     * @returns A promise that resolves if the review score is updated successfully, otherwise rejects with an error.
     * @throws An error if there is a problem updating the review score, or if the instructor is not authorized to update the review.
     */
    async updateScore(
        tokenPayload: string,
        reviewId: string,
        practical: number,
        theory: number
    ): Promise<IReviewDto | void> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Instutructor id
            const instructorId = _id as unknown as ObjectId;

            // Find review
            const review = await this.reviewRepository.findOne({ _id: reviewId });

            if (!review) throw new BadRequestError("Review not found");

            // Check weather instructor is authorized
            if (instructorId != review.instructorId)
                throw new Error("You are restricted to update this review !");

            // Find latest review of the user
            let latestReview = await this.reviewRepository.findReviewsWithLimit(
                review.studentId as unknown as string,
                "",
                1
            );

            if (!latestReview) throw new BadRequestError("Failed to update score !");

            // Check weather, we are updating the latest review of a user
            if (latestReview[0].time && latestReview[0]._id != reviewId)
                throw new Error("You can't update previous review score !");

            // Check weather, review is completed
            if (review.status !== "Completed")
                throw new Error("Review is not completed yet !");

            // Check weather, pass or fail
            let flag = practical >= 5 && theory >= 5;

            let nextWeek;
            let scheduleRequired;
            let scheduleData: Partial<IReviewSchema> | undefined;

            // Next review date
            const currentReviewDate = new Date(review.date);
            const nextReviewDate = new Date(currentReviewDate);
            nextReviewDate.setDate(nextReviewDate.getDate() + 7);

            if (flag) {
                // Pass

                // Next week name
                let nextWeekName;

                if (review.weekId) {
                    const currentweek = await getCachedWeek(review.weekId);

                    const [weekName, suffix] = currentweek?.name.split(" ") as string[];

                    nextWeekName = `${weekName} ${Number(suffix) + 1}`;
                } else {
                    nextWeekName = "Week 1";
                }

                // Get all weeks from cache
                const allWeeks = await getAllWeeks();
                const weekObj = allWeeks.find((week) => week.name === nextWeekName);

                if (!weekObj) {
                    // No schedule
                    scheduleRequired = false;
                    nextWeek = review.weekId ? review.weekId : null;

                    console.log("no need to schedule next review!");
                } else {
                    // Next review domainsWeek
                    const domain = await getCachedDomain(review.domainId);
                    if (!domain) throw new BadRequestError("Failed to update score !");

                    const domainsWeek = domain.domainsWeeks.find(
                        (week) => week.week._id === weekObj._id
                    );

                    if (domainsWeek) {
                        // Schedule
                        scheduleRequired = true;
                        nextWeek = weekObj._id as unknown as string;

                        scheduleData = {
                            instructorId: (await getAvailableInstructor(
                                this.reviewRepository,
                                review.domainId as unknown as string
                            )) as unknown as ObjectId,
                            studentId: review.studentId,
                            batchId: review.batchId,
                            domainId: review.domainId,
                            weekId: nextWeek as unknown as ObjectId,
                            title: domainsWeek.title,
                            category: "Weekly",
                            date: nextReviewDate,
                            time: "",
                        };
                    } else {
                        // No schedule
                        scheduleRequired = false;
                        nextWeek = review.weekId ? review.weekId : null;

                        console.log("no need to schedule next review!");
                    }
                }
            } else {
                // Fail
                scheduleRequired = true;
                nextWeek = review.weekId ? review.weekId : null; // Old week

                // Schedule
                scheduleData = {
                    instructorId: (await getAvailableInstructor(
                        this.reviewRepository,
                        review.domainId as unknown as string
                    )) as unknown as ObjectId,
                    studentId: review.studentId,
                    batchId: review.batchId,
                    domainId: review.domainId,
                    ...(nextWeek && { weekId: nextWeek as unknown as ObjectId }),
                    title: review.title,
                    category: review.category,
                    date: nextReviewDate,
                    time: "",
                };
            }

            // Update user(student's) week through gRPC
            const resp = await updateUser(review.studentId as unknown as string, {
                week: nextWeek,
            });

            // Success resposne
            if (resp && resp.response.status !== 200)
                throw new Error("Failed to update score !");

            // Update review score and result
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                {
                    $set: {
                        score: { practical, theory },
                        result: flag ? "Pass" : "Fail",
                    },
                }
            );

            if (!updatedReview) throw new Error("Failed to update score !");

            // Schedule next review
            if (scheduleRequired && scheduleData) {
                let scheduledReview: IReviewSchema;

                // Find the latest review of a student
                const latestReview = await this.reviewRepository.findReviewsWithLimit(
                    scheduleData.studentId as unknown as string,
                    "",
                    1
                );

                if (
                    latestReview &&
                    latestReview.length > 0 &&
                    latestReview[0]._id != reviewId
                ) {
                    // Update existing review
                    const updatedReview = await this.reviewRepository.update(
                        { _id: latestReview[0]._id },
                        { $set: scheduleData },
                        { new: true }
                    );

                    if (!updatedReview) throw new Error("Failed to schedule review!");

                    scheduledReview = updatedReview;
                } else {
                    // Create new review
                    const review = await this.reviewRepository.create(scheduleData);

                    if (!review) throw new Error("Failed to schedule review!");

                    scheduledReview = review;
                }

                // Get student and instructor info through gRPC
                let student;
                let instructor;

                const resp1Promise = getUser(
                    scheduledReview.studentId as unknown as string
                );
                const resp2Promise = getUser(
                    scheduledReview.instructorId as unknown as string
                );

                const [resp1, resp2] = await Promise.all([resp1Promise, resp2Promise]);

                if (
                    resp1 &&
                    resp2 &&
                    resp1.response.status === 200 &&
                    resp2.response.status === 200
                ) {
                    student = resp1.response.user;
                    instructor = resp2.response.user;
                } else {
                    throw new Error("Failed to schedule review!");
                }

                return {
                    _id: scheduledReview._id as unknown as string,
                    instructor: instructor as IUser,
                    student: student as IStudent,
                    title: scheduledReview.title,
                    week: (await getCachedWeek(scheduledReview.weekId)) as IWeek,
                    date: scheduledReview.date,
                    time: scheduledReview.time,
                    category: scheduledReview.category as IReveiewCategory,
                    score: scheduledReview.score,
                    result: scheduledReview.result,
                    status: scheduledReview.status,
                    pendings: scheduledReview.pendings,
                    feedback: scheduledReview.feedback,
                    rating: scheduledReview.rating,
                    createdAt: scheduledReview.createdAt,
                    updatedAt: scheduledReview.updatedAt,
                };
            }
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Searches for reviews based on the given parameters, retrieves additional user information,
     * and returns detailed review data.
     * @param tokenPayload - The JWT token payload containing user identification information.
     * @param batchId - The ID of the batch to search for reviews in.
     * @param studentId - The ID of the student to search for reviews from.
     * @param domainId - The ID of the domain to search for reviews in.
     * @param weekId - The ID of the week to search for reviews in.
     * @param sort - The field to sort the result by.
     * @param order - The order of the sorting, either 1 for ascending or -1 for descending.
     * @param date - The date to search for reviews on.
     * @param status - The status of the reviews to search for.
     * @param category - The category of the reviews to search for.
     * @param skip - The number of records to skip in the result set.
     * @returns A promise that resolves to an array of detailed review DTOs with user information.
     * @throws An error if there is a problem retrieving the reviews or user information.
     */
    async searchReviews(
        tokenPayload: string,
        batchId: string,
        studentId: string,
        domainId: string,
        weekId: string,
        sort: string,
        order: number,
        date: string,
        status: string,
        category: IReveiewCategory,
        skip: number
    ): Promise<IReviewDto[]> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Instutructor id
            const instructorId = _id;

            const reviews = await this.reviewRepository.searchReviews(
                instructorId,
                batchId,
                studentId,
                domainId,
                weekId,
                sort,
                order,
                date,
                status,
                category,
                skip
            );

            if (!reviews || !reviews.length) {
                return [];
            }

            const userIds = []; // UserIds

            for (let i = 0; i < reviews.length; i++) {
                userIds.push(
                    ...[
                        reviews[i].studentId as unknown as string,
                        reviews[i].instructorId as unknown as string,
                    ]
                );
            }

            // Users info through gRPC
            let usersMap: Record<string, IUser | IStudent>;

            const resp = await getUsers([...new Set(userIds)], "");

            if (resp && resp.response.status === 200) {
                usersMap = resp.response.users;
            }

            // Reviews detils with users info
            return Promise.all(
                reviews.map(async (review) => ({
                    _id: review._id as unknown as string,
                    student: usersMap[review.studentId as unknown as string] as IStudent,
                    instructor: usersMap[
                        review.instructorId as unknown as string
                    ] as IUser,
                    title: review.title,
                    week: (await getCachedWeek(review.weekId)) as IWeek,
                    date: review.date,
                    time: review.time,
                    category: review.category as IReveiewCategory,
                    score: review.score,
                    result: review.result,
                    status: review.status,
                    pendings: review.pendings,
                    feedback: review.feedback,
                    rating: review.rating,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt,
                }))
            );
        } catch (err: unknown) {
            throw err;
        }
    }
}
