import {
    ConflictError,
    JwtPayloadType,
    NotFoundError,
    UnauthorizedError,
} from "@codeflare/common";
import { IReviewDto, IUser } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../../repository/interface/IReviewRepository";
import { IReviewService } from "../interface/IReviewService";
import { getUser, getUsers, updateUser } from "../../grpc/client/userClient";
import mongoose, { Mongoose, ObjectId, Schema, Types } from "mongoose";

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
     * @param batchIds - The list of batchIds to retrieve scheduled reviews for.
     * @returns A promise that resolves to an array of scheduled review DTOs.
     * @throws An error if there is a problem retrieving the reviews.
     */
    async getScheduledReviews(userId: string): Promise<IReviewDto[]> {
        try {
            const reviews = await this.reviewRepository.findReviewsWithLimit(userId);

            if (!reviews || !reviews.length)
                throw new NotFoundError("Reviews not found");

            const userIds = []; // UserIds

            for (let i = 0; i < reviews.length; i++) {
                userIds.push(
                    ...[
                        reviews[i].userId as unknown as string,
                        reviews[i].instructorId as unknown as string,
                    ]
                );
            }

            // Users info through gRPC
            const usersMap = (await getUsers([...new Set(userIds)])) as any;

            // Reviews detils with user info
            return reviews.map((review) => ({
                ...(review as unknown as IReviewDto),
                user: usersMap[review.userId as unknown as string],
                instructor: usersMap[review.instructorId as unknown as string],
            }));
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Schedules a review for a user.
     * @param data - The partial review schema containing necessary data to schedule a review.
     * @returns A promise that resolves to a partial review DTO containing the scheduled review details.
     * @throws ConflictError if a review is already scheduled for the given user and week.
     * @throws Error if there is a problem scheduling the review.
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
                data.userId as unknown as string,
                data.week as string,
                1
            );

            // Check review status is pending or completed
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

            // Schedule review
            const review = await this.reviewRepository.create({
                ...data,
                instructorId,
            });

            if (!review) throw new Error("Failed to schedule review !");

            // User and instrucor details through gRPC
            const user = await getUser(data.userId as unknown as string);
            const instructor = await getUser(instructorId as unknown as string);

            // Map data to reutrn type
            const reviewDto: Partial<IReviewDto> = {
                _id: review._id,
                instructor: instructor as unknown as IUser,
                user: user as unknown as IUser,
                batchId: review.batchId as unknown as string,
                title: review.title,
                week: review.week,
                date: review.date,
                time: review.time,
                status: review.status,
                result: review.result,
                feedback: review.feedback,
                score: review.score,
                updatedAt: review.updatedAt,
            };

            return reviewDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates a review for a user.
     * @param data - The data used to update a review.
     * @param reviewId - The id of the review to update.
     * @returns A promise that resolves to a review DTO.
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
                    review.userId as unknown as string,
                    "",
                    1
                );

                if (!latestReview) throw new Error("Failed to update review !");

                // Check weather, we are updating the latest review of a user
                if (latestReview[0]._id != reviewId)
                    throw new Error("You can't update previous review details !");
            }

            // User info through gRPC
            const user = await getUser(review.userId as unknown as string);
            const instructor = await getUser(instructorId as unknown as string);

            // Update review
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: data }
            );

            if (!updatedReview) throw new Error("Failed to update review !");

            // Map data to return type
            const reviewDto: IReviewDto = {
                _id: updatedReview._id,
                instructor: instructor as unknown as IUser,
                user: user as unknown as IUser,
                batchId: updatedReview.batchId as unknown as string,
                title: updatedReview.title,
                week: updatedReview.week,
                date: updatedReview.date,
                time: updatedReview.time,
                rating: updatedReview.rating,
                feedback: updatedReview.feedback,
                pendings: updatedReview.pendings,
                score: updatedReview.score,
                status: updatedReview.status,
                result: updatedReview.result,
                updatedAt: updatedReview.updatedAt,
            };
            return reviewDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Changes the status of a review with the given id.
     * @param reviewId - The id of the review to update.
     * @param userId - The id of the user who the review belongs to.
     * @param week - The week of the review.
     * @param status - The new status of the review.
     * @returns A promise that resolves when the review status is updated successfully.
     * @throws An error if there is a problem updating the review status.
     */
    async changeStatus(
        tokenPayload: string,
        reviewId: string,
        status: string
    ): Promise<void> {
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
                review.userId as unknown as string,
                "",
                1
            );

            if (!latestReview) throw new Error("Failed to update status !");

            // Check weather, we are updating the latest review of a user
            if (latestReview[0]._id != reviewId)
                throw new Error("You can't update previous review status !");

            // Find the last two reviews of the user of same week
            let reviews = await this.reviewRepository.findReviewsWithLimit(
                review.userId as unknown as string,
                review.week,
                2
            );

            if (!reviews) throw new Error("Failed to update status !");

            let flag = false;

            // Check weather, status of previous review of same week is Absent
            if (
                reviews.length >= 2 &&
                reviews[1].status === "Absent" &&
                status === "Absent"
            ) {
                flag = true;
            }

            // Update user through gRPC
            const { response } = await updateUser(
                review.userId as unknown as string,
                {
                    stage: flag ? "Intake" : "Normal",
                    week: review.week, // Old week
                }
            );

            if (response.status !== 200) throw new Error("Failed to update status !");

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
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the score of a review.
     * @param reviewId - The id of the review to update.
     * @param practical - The practical score of the review.
     * @param theory - The theory score of the review.
     * @returns A promise that resolves when the review score is updated successfully.
     * @throws An error if there is a problem updating the review score.
     */
    async updateScore(
        tokenPayload: string,
        reviewId: string,
        practical: number,
        theory: number
    ): Promise<void> {
        try {
            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Instutructor id
            const instructorId = _id as unknown as ObjectId;

            // Find review
            const review = await this.reviewRepository.findOne({ _id: reviewId });

            if (!review) throw new Error("Review not found");

            // Cheak weather instructor is authorized
            if (instructorId != review.instructorId)
                throw new Error("You are restricted to update this review !");

            // Find latest review of the user
            let latestReview = await this.reviewRepository.findReviewsWithLimit(
                review.userId as unknown as string,
                "",
                1
            );

            if (!latestReview) throw new Error("Failed to update status !");

            // Check weather, we are updating the latest review of a user
            if (latestReview[0]._id != reviewId)
                throw new Error("You can't update previous review score !");

            // Check weather, review is completed
            if (review.status !== "Completed")
                throw new Error("Review is not completed yet !");

            // Check weather, pass or fail
            let flag = practical >= 5 && theory >= 5;

            let nextWeek;

            if (flag) {
                const splitedWeek = review.week.split(" ");
                nextWeek = splitedWeek[0] + " " + (Number(splitedWeek[1]) + 1); // New week
            } else {
                nextWeek = review.week; // Old week
            }

            // Update user through gRPC
            const { response } = await updateUser(
                review.userId as unknown as string,
                { week: nextWeek }
            );

            if (response.status !== 200) throw new Error("Failed to update score !");

            // Update review
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
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Searches for reviews based on the given keyword, sort, order, status, and batchIds.
     * @param keyword - The keyword to search for in the review's title, week, or user's name or email.
     * @param sort - The field to sort the result by.
     * @param order - The order to sort the result by, either 1 for ascending or -1 for descending.
     * @param status - The status of the reviews to search for, either "true" or "false".
     * @param batchIds - The list of batchIds to search for reviews in.
     * @returns A promise that resolves to an array of review DTOs if successful, otherwise an empty array.
     * @throws An error if there is a problem searching for the reviews.
     */
    async searchReviews(
        keyword: string,
        sort: string,
        order: number,
        date: string,
        status: string,
        batchIds: string[],
        skip: number
    ): Promise<IReviewDto[]> {
        try {
            const reviews = await this.reviewRepository.searchReviews(
                keyword,
                sort,
                order,
                date,
                status,
                batchIds,
                skip
            );

            if (!reviews || !reviews.length) {
                return [];
            }

            const userIds = []; // UserIds

            for (let i = 0; i < reviews.length; i++) {
                userIds.push(
                    ...[
                        reviews[i].userId as unknown as string,
                        reviews[i].instructorId as unknown as string,
                    ]
                );
            }

            // Users info through gRPC
            const usersMap = (await getUsers([...new Set(userIds)])) as any;

            // Reviews detils with user info
            return reviews.map((review) => ({
                ...(review.toObject ? review.toObject() : review),
                user: usersMap[review.userId as unknown as string],
                instructor: usersMap[review.instructorId as unknown as string],
            }));
        } catch (err: unknown) {
            throw err;
        }
    }
}
