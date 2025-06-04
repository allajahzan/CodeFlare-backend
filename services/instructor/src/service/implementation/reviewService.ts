import {
    BadRequestError,
    ConflictError,
    IBatch,
    IReviewCategory,
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
import { isReviewsDateAndTimeOver } from "../../utils/checkReviewsDateAndTime";
import { getCachedBatch } from "../../utils/cachedBatch";

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
     * Retrieves scheduled reviews for a given list of batchIds.
     * @param studentId - The id of the user to retrieve reviews for.
     * @param weekId - The week to retrieve reviews for.
     * @param status - The status of the reviews to search for, either "true" or "false".
     * @param result - The result of the reviews to search for, either "true" or "false".
     * @returns A promise that resolves to an array of scheduled review DTOs with user information.
     * @throws An error if there is a problem retrieving the reviews.
     */
    async getScheduledReviews(
        studentId: string,
        weekId: string,
        status: string,
        result: string
    ): Promise<IReviewDto[]> {
        try {
            const reviews = await this.reviewRepository.searchReviews(
                "",
                "",
                studentId,
                "",
                weekId,
                "",
                0,
                "",
                status,
                "",
                result,
                0
            );

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
                    category: review.category as IReviewCategory,
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
     * Schedules a review for a user. This is used to schedule a review immediately after a user select a domain.
     * @param tokenPayload - The JWT token payload containing user identification information.
     * @param data - The data used to schedule a review.
     * @returns A promise that resolves when the review has been scheduled.
     * @throws An error if there is a problem scheduling the review.
     */
    async scheduleFoundationReview(
        tokenPayload: string,
        data: Partial<IReviewSchema>
    ): Promise<void> {
        try {
            const { _id, role } = JSON.parse(tokenPayload) as JwtPayloadType; // Requester id and role
            const studentId = _id as unknown as ObjectId;

            // Schedule review only for student
            if (role === "student") {
                // Get available instructor of same domain
                const instructorId = await getAvailableInstructor(
                    this.reviewRepository,
                    data.domainId as unknown as string
                );

                if (!instructorId) {
                    throw new BadRequestError(
                        "No available instructors for this domain!"
                    );
                }

                // Review date
                const reviewDate = new Date();
                reviewDate.setDate(reviewDate.getDate() + 3);

                // Check if review exists
                const isReviewExists = await this.reviewRepository.findOne({
                    studentId,
                    weekId: data.weekId,
                    category: "Foundation",
                });

                if (isReviewExists)
                    throw new BadRequestError("Domain already selected!");

                // Update user(student) through gRPC
                const resp = await updateUser(studentId as unknown as string, {
                    week: data.weekId,
                    category: "Foundation",
                    review: "Foundation",
                });

                if (resp && resp.response.status !== 200)
                    throw new Error("Failed to select domain!");

                // Schdule review
                const scheduledReview = await this.reviewRepository.create({
                    instructorId: instructorId as unknown as ObjectId,
                    studentId,
                    batchId: data.batchId,
                    domainId: data.domainId,
                    weekId: data.weekId,
                    title: "Foundation",
                    category: "Foundation",
                    date: reviewDate,
                    time: "",
                });

                if (!scheduledReview)
                    throw new BadRequestError("Failed to select domain!");
            }
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
                data.category as IReviewCategory,
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
                            ? "Review already scheduled for this student!"
                            : "Review already scheduled by another instructor!"
                        : isReviewExists[0].instructorId == instructorId
                            ? "Review already completed. please update score!"
                            : "Review already completed by another instructor!"
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
                category: review.category as IReviewCategory,
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
                throw new Error("You are restricted to update this review!");

            // If date and time updates
            if (data.date || data.time) {
                // Check weather review's date and time is over or not
                if (
                    await isReviewsDateAndTimeOver(review.date, review.time, "details")
                ) {
                    throw new BadRequestError("Review's date and time is over!");
                }

                // Find the latest review of the user
                let latestReview = await this.reviewRepository.findReviewsWithLimit(
                    review.studentId as unknown as string,
                    "",
                    "",
                    1
                );

                if (!latestReview) throw new Error("Failed to update review!");

                // Check weather, we are updating the latest review of a user
                if (latestReview[0].time && latestReview[0]._id != reviewId)
                    throw new Error("You can't update previous review details!");
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

            if (!updatedReview) throw new Error("Failed to update review!");

            // Map data to return type
            const reviewDto: IReviewDto = {
                _id: updatedReview._id as unknown as string,
                student: user as unknown as IStudent,
                instructor: instructor as unknown as IUser,
                title: updatedReview.title,
                week: (await getCachedWeek(updatedReview.weekId)) as IWeek,
                date: updatedReview.date,
                time: updatedReview.time,
                category: updatedReview.category as IReviewCategory,
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

            if (!review) throw new Error("Review not found!");

            // Check weather instructor is authorized
            if (instructorId != review.instructorId)
                throw new Error("You are restricted to update this review!");

            // Find the latest review of the user
            let latestReview = await this.reviewRepository.findReviewsWithLimit(
                review.studentId as unknown as string,
                "",
                "",
                1
            );

            if (!latestReview) throw new Error("Failed to update status!");

            // Check weather, we are updating the latest review of a user
            if (latestReview[0].time && latestReview[0]._id != reviewId)
                throw new Error("You can't update previous review status!");

            // Check weather review's date and time is over or not
            if (status !== "Cancelled" && status !== "Pending") {
                if (
                    !(await isReviewsDateAndTimeOver(review.date, review.time, "status"))
                ) {
                    throw new BadRequestError("Review's date and time is not over yet!");
                }
            }

            // If status is not completed
            let deletedReview;

            if (status !== "Completed" && review.category !== "Normal") {
                let scheduleRequired = false;
                let scheduleData: Partial<IReviewSchema> | undefined;

                let previousWeek = review.weekId;
                let category = review.category;

                // Schedule next review if status is 'Absent'
                if (status === "Absent" && review.category !== "Normal") {
                    // Find last review of student with status 'Completed'
                    let lastReview = await this.reviewRepository.findReviewsWithLimit(
                        review.studentId as unknown as string,
                        "",
                        "",
                        1,
                        "Completed"
                    );

                    // Next review date
                    const currentReviewDate = new Date(review.date);
                    const nextReviewDate = new Date(currentReviewDate);
                    nextReviewDate.setDate(nextReviewDate.getDate() + 3);

                    if (lastReview && lastReview.length > 0) {
                        const lastReviewDate = new Date(lastReview[0].date);

                        const diff = nextReviewDate.getTime() - lastReviewDate.getTime();

                        const totalDaysWithoutAttending = Math.floor(
                            diff / (1000 * 60 * 60 * 24)
                        );

                        if (
                            totalDaysWithoutAttending > 7 &&
                            review.category !== "QA" &&
                            review.category !== "Foundation"
                        ) {
                            category = "InTake";
                        }
                    }

                    scheduleRequired = true;

                    // Schedule next review
                    scheduleData = {
                        instructorId: (await getAvailableInstructor(
                            this.reviewRepository,
                            review.domainId as unknown as string
                        )) as unknown as ObjectId,
                        studentId: review.studentId,
                        batchId: review.batchId,
                        domainId: review.domainId,
                        weekId: review.weekId,
                        title: review.title,
                        category,
                        date: nextReviewDate,
                        time: "",
                    };
                }

                // Update user(student) through gRPC
                const resp = await updateUser(review.studentId as unknown as string, {
                    week: previousWeek,
                    category: review.category === "Foundation" ? "Foundation" : "Ongoing",
                    review: category,
                });

                if (resp && resp.response.status !== 200)
                    throw new Error("Failed to update status!");

                // Find the latest review of student
                const latestReview = await this.reviewRepository.findReviewsWithLimit(
                    review.studentId as unknown as string,
                    "",
                    "",
                    1
                );

                // Delete the latest scheduled review (*new review - not the review which we are updating now)
                if (
                    latestReview &&
                    latestReview.length > 0 &&
                    latestReview[0]._id != reviewId
                ) {
                    deletedReview = latestReview[0];
                    await this.reviewRepository.delete({ _id: latestReview[0]._id });
                }

                // If schedule required
                if (scheduleRequired && scheduleData) {
                    const scheduledReview = await this.reviewRepository.create(
                        scheduleData
                    );

                    if (!scheduledReview)
                        throw new Error("Failed to schedule next review!");
                }
            }

            // Update review status
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                {
                    $set: {
                        status: status,
                        ...(status !== "Completed" &&
                            review.category !== "Normal" && { result: null, score: null }),
                    },
                }
            );

            if (!updatedReview) throw new Error("Failed to update status!");

            // Return _id of deleted review
            if (deletedReview) {
                return { _id: deletedReview._id as unknown as string };
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

            if (!review) throw new BadRequestError("Review not found!");

            // Check weather instructor is authorized
            if (instructorId != review.instructorId)
                throw new Error("You are restricted to update this review!");

            // Find latest review of the user
            let latestReview = await this.reviewRepository.findReviewsWithLimit(
                review.studentId as unknown as string,
                "",
                "",
                1
            );

            if (!latestReview) throw new BadRequestError("Failed to update score!");

            // Check weather, we are updating the latest review of a user
            if (latestReview[0].time && latestReview[0]._id != reviewId)
                throw new Error("You can't update previous review score!");

            // Check weather review's date and time is over or not
            if (
                !(await isReviewsDateAndTimeOver(review.date, review.time, "score"))
            ) {
                throw new BadRequestError("Review's date and time is not over yet!");
            }

            // Check weather, review is completed
            if (review.status !== "Completed")
                throw new Error("Review is not completed yet!");

            // Check weather, review is Normal
            if (review.category === "Normal") {
                throw new BadRequestError("You can't update score for Normal review!");
            }

            // Check weather, pass or fail
            let flag = practical >= 5 && theory >= 5;

            let nextWeek = review.weekId as unknown as string;
            let scheduleRequired;
            let scheduleData: Partial<IReviewSchema> | undefined;

            // Next review date
            const currentReviewDate = new Date(review.date);
            const nextReviewDate = new Date(currentReviewDate);
            nextReviewDate.setDate(nextReviewDate.getDate() + 3);

            // Next review category
            let category = "Weekly";

            // Student category
            let studentCategory =
                review.category === "Foundation" ? "Foundation" : "Ongoing";

            if (review.category === "Weekly") {
                // Last 2 reviews of the student of same weekId
                const lastTwoReviews = await this.reviewRepository.findReviewsWithLimit(
                    review.studentId as unknown as string,
                    review.weekId as unknown as string,
                    "Weekly",
                    2,
                    "Completed"
                );

                if (lastTwoReviews && lastTwoReviews.length > 1) {
                    if (!flag && lastTwoReviews[1].result === "Fail") {
                        category = "QA";
                    }
                }
            } else {
                category = flag ? "Weekly" : review.category;
            }

            if (flag) {
                // Pass

                // Next week name
                let nextWeekName;

                const currentweek = await getCachedWeek(review.weekId);
                const [weekName, suffix] = currentweek?.name.split(" ") as string[];

                if (review.category === "Weekly" || review.category === "Foundation") {
                    nextWeekName = `${weekName} ${Number(suffix) + 1}`;
                } else {
                    nextWeekName = currentweek?.name;
                }

                // Get all weeks from cache
                const allWeeks = await getAllWeeks();
                const weekObj = allWeeks.find((week) => week.name === nextWeekName);

                if (!weekObj) {
                    // No schedule
                    scheduleRequired = false;

                    console.log("no need to schedule next review!");
                } else {
                    // Next review week in domain's Weeks
                    const domain = await getCachedDomain(review.domainId);
                    if (!domain) throw new BadRequestError("Failed to update score!");

                    const domainsWeek = domain.domainsWeeks.find(
                        (domainsWeek) => domainsWeek.week._id === weekObj._id
                    );

                    if (domainsWeek) {
                        // Schedule
                        scheduleRequired = true;
                        studentCategory = "Ongoing";

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
                            category,
                            date: nextReviewDate,
                            time: "",
                        };
                    } else {
                        // No schedule
                        scheduleRequired = false;
                        studentCategory = "Placement";

                        console.log("no need to schedule next review!");
                    }
                }
            } else {
                // Fail
                scheduleRequired = true;

                // Schedule
                scheduleData = {
                    instructorId: (await getAvailableInstructor(
                        this.reviewRepository,
                        review.domainId as unknown as string
                    )) as unknown as ObjectId,
                    studentId: review.studentId,
                    batchId: review.batchId,
                    domainId: review.domainId,
                    weekId: nextWeek as unknown as ObjectId,
                    title: review.title,
                    category,
                    date: nextReviewDate,
                    time: "",
                };
            }

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

            if (!updatedReview) throw new Error("Failed to update score!");

            // Update user(student) through gRPC
            const resp = await updateUser(review.studentId as unknown as string, {
                week: nextWeek,
                category: studentCategory,
                review: category,
            });

            if (resp && resp.response.status !== 200)
                throw new Error("Failed to update score!");

            // Schedule next review
            if (scheduleRequired && scheduleData) {
                let scheduledReview: IReviewSchema;

                // Find the latest review of a student
                const latestReview = await this.reviewRepository.findReviewsWithLimit(
                    scheduleData.studentId as unknown as string,
                    "",
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

                    if (!updatedReview)
                        throw new Error("Failed to schedule next review!");

                    scheduledReview = updatedReview;
                } else {
                    // Create new review
                    const review = await this.reviewRepository.create(scheduleData);

                    if (!review) throw new Error("Failed to schedule next review!");

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
                    throw new Error("Failed to schedule next review!");
                }

                return {
                    _id: scheduledReview._id as unknown as string,
                    instructor: instructor as IUser,
                    student: student as IStudent,
                    title: scheduledReview.title,
                    week: (await getCachedWeek(scheduledReview.weekId)) as IWeek,
                    date: scheduledReview.date,
                    time: scheduledReview.time,
                    category: scheduledReview.category as IReviewCategory,
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
        category: IReviewCategory,
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
                "",
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
                    batch: (await getCachedBatch(review.batchId)) as IBatch,
                    date: review.date,
                    time: review.time,
                    category: review.category as IReviewCategory,
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
