import { ConflictError } from "@codeflare/common";
import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../../repository/interface/IReviewRepository";
import { IReviewService } from "../interface/IReviewService";
import { getUsers } from "../../grpc/client/userClient";

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

            // Map data to reutrn type
            const reviewDto: Partial<IReviewDto> = {
                _id: review._id,
                userId: review.userId as unknown as string,
                batchId: review.batchId as unknown as string,
                title: review.title,
                week: review.week,
                date: review.date,
                time: review.time,
                status: review.status,
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
            const review = await this.reviewRepository.update(
                { _id: reviewId },
                { $set: data }
            );

            if (!review) throw new Error("Failed to create review");

            // Map data to return type
            const reviewDto: IReviewDto = {
                _id: review._id,
                userId: review.userId as unknown as string,
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
            };
            return reviewDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
