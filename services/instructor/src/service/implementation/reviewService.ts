import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../../repository/interface/IReviewRepository";
import { IReviewService } from "../interface/IReviewService";

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
     * Schedules a review for a user.
     * @param data - The data used to create a review.
     * @returns A promise that resolves to a review DTO.
     * @throws An error if there is a problem scheduling the review.
     */
    async scheduleReview(data: Partial<IReviewSchema>): Promise<IReviewDto> {
        try {
            const review = await this.reviewRepository.create(data);

            if (!review) throw new Error("Failed to create review");

            const reviewDto: IReviewDto = {
                _id: review._id,
                userId: review.userId as unknown as string,
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
                tech: review.score.tech,
                theory: review.score.theory,
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

            const reviewDto: IReviewDto = {
                _id: review._id,
                userId: review.userId as unknown as string,
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
                tech: review.score.tech,
                theory: review.score.theory,
            };
            return reviewDto;
        } catch (err: unknown) {
            throw err;
        }
    }
}
