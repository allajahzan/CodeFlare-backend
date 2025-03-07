import { ConflictError, NotFoundError } from "@codeflare/common";
import { IReviewDto, IUser } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../../repository/interface/IReviewRepository";
import { IReviewService } from "../interface/IReviewService";
import { getUser, getUsers, updateUser } from "../../grpc/client/userClient";
import { ObjectId, Types } from "mongoose";

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
    async getScheduledReviews(batchIds: string[]): Promise<IReviewDto[]> {
        try {
            const reviews = await this.reviewRepository.find({
                batchId: { $in: batchIds },
            });

            if (!reviews || !reviews.length) {
                return [];
            }

            const userIds = []; // UserIds

            for (let i = 0; i < reviews.length; i++) {
                userIds.push(reviews[i].userId as unknown as string);
            }

            // Users info through gRPC
            const usersMap = (await getUsers([...new Set(userIds)])) as any;

            // Reviews detils with user info
            return reviews.map((review) => ({
                ...review.toObject(),
                user: usersMap[review.userId as unknown as string],
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
        data: Partial<IReviewSchema>
    ): Promise<Partial<IReviewDto>> {
        try {
            // Find the latest review of a user for a perticular week
            const isReviewExists = await this.reviewRepository.findReviewsWithLimit(
                data.userId as unknown as string,
                data.week as string,
                1
            );

            // Check review status is pending or completed
            if (
                isReviewExists?.[0].status === "Pending" ||
                isReviewExists?.[0].status === "Completed"
            )
                throw new ConflictError(
                    isReviewExists?.[0].status === "Pending"
                        ? "Review already scheduled for this week !"
                        : "Review already completed for this week !"
                );

            const review = await this.reviewRepository.create(data); // Schedule review

            if (!review) throw new Error("Failed to schedule review !");

            // User info through gRPC
            const user = await getUser(data.userId as unknown as string);

            // Map data to reutrn type
            const reviewDto: Partial<IReviewDto> = {
                _id: review._id,
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
        data: Partial<IReviewSchema>,
        reviewId: string
    ): Promise<IReviewDto> {
        try {
            // Find review
            const review = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: data }
            );

            if (!review) throw new Error("Failed to update review !");

            // User info through gRPC
            const user = await getUser(review.userId as unknown as string);

            // Map data to return type
            const reviewDto: IReviewDto = {
                _id: review._id,
                user: user as unknown as IUser,
                batchId: review.batchId as unknown as string,
                title: review.title,
                week: review.week,
                date: review.date,
                time: review.time,
                rating: review.rating,
                feedback: review.feedback,
                pendings: review.pendings,
                score: {
                    tech: review.score.tech,
                    theory: review.score.theory,
                },
                status: review.status,
                result: review.result,
                updatedAt: review.updatedAt,
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
        reviewId: string,
        userId: string,
        week: string,
        status: string
    ): Promise<void> {
        try {
            // Find review
            const review = await this.reviewRepository.findOne({ _id: reviewId });

            if (!review) throw new Error("Review not found");

            // Find the last 2 reviews of the user with same week
            let reviews = await this.reviewRepository.findReviewsWithLimit(
                userId,
                week,
                2
            );

            if (!reviews) throw new Error("Failed to update status !");

            // Check weather, we are updating the latest review of a user of a perticular week
            if (reviews[0]._id != reviewId)
                throw new Error("Can't update previous review status !");

            let flag = false;

            if (
                reviews.length >= 2 &&
                reviews[1].status === "Absent" &&
                status === "Absent"
            ) {
                flag = true;
            } // Check weather, status of the latest 2 reviews of a user with same week, are absent

            // Update user through gRPC
            const { response } = await updateUser(userId, {
                stage: flag ? "Intake" : "Normal",
            });

            if (response.status !== 200) throw new Error("Failed to update status !");

            // Update review status
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: { status: status } }
            );

            if (!updatedReview) throw new Error("Failed to update status !");
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the score of a review.
     * @param reviewId - The id of the review to update.
     * @param practical - The practical score to be updated.
     * @param theory - The theory score to be updated.
     * @param result - The result of the review, either "Pass" or "Fail".
     * @returns A promise that resolves when the review score is updated successfully.
     * @throws NotFoundError if the review is not found.
     * @throws Error if there is a problem updating the score or if the gRPC update fails.
     */
    async updateScore(
        reviewId: string,
        practical: number,
        theory: number,
        result: string
    ): Promise<void> {
        try {
            // Find review
            const review = await this.reviewRepository.findOne({ _id: reviewId });

            if (!review) throw new NotFoundError("Review not found");

            // Check if result is pass
            if (result === "Pass") {
                const splitedWeek = review.week.split(" ");

                const week = splitedWeek[0] + " " + (Number(splitedWeek[1]) + 1); // Next week

                // Update user through gRPC
                const { response } = await updateUser(
                    review.userId as unknown as string,
                    { week }
                );

                if (response.status !== 200)
                    throw new Error("Failed to update score !");
            }

            // Update review
            const updatedReview = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: { score: { practical, theory }, result } }
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
                userIds.push(reviews[i].userId as unknown as string);
            }

            // Users info through gRPC
            const usersMap = (await getUsers([...new Set(userIds)])) as any;

            // Reviews detils with user info
            return reviews.map((review) => ({
                ...(review.toObject ? review.toObject() : review),
                user: usersMap[review.userId as unknown as string],
            }));
        } catch (err: unknown) {
            throw err;
        }
    }
}
