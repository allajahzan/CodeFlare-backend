import { ConflictError } from "@codeflare/common";
import { IReviewDto, IUser } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../../repository/interface/IReviewRepository";
import { IReviewService } from "../interface/IReviewService";
import { getUser, getUsers } from "../../grpc/client/userClient";

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
            const isReviewExists = await this.reviewRepository.findOne({
                userId: data.userId,
                week: data.week,
            });

            // Review alredy scheduled
            if (isReviewExists)
                throw new ConflictError("Already scheduled a review !");

            const review = await this.reviewRepository.create(data);

            if (!review) throw new Error("Failed to schedule review");

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
                createdAt: review.createdAt,
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
        console.log(data, reviewId);
        
        try {
            const review = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: data }
            );

            if (!review) throw new Error("Failed to create review");

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
                createdAt: review.createdAt,
            };
            return reviewDto;
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
        batchIds: string[]
    ): Promise<IReviewDto[]> {
        try {
            const reviews = await this.reviewRepository.searchReviews(
                keyword,
                sort,
                order,
                date,
                status,
                batchIds
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
