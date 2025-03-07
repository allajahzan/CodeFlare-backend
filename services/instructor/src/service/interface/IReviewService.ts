import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Service */
export interface IReviewService {
    getScheduledReviews(batchIds: string[]) : Promise<IReviewDto[]>
    scheduleReview(data: Partial<IReviewSchema>): Promise<Partial<IReviewDto>>;
    updateReview(data: Partial<IReviewSchema>, reviewId: string): Promise<IReviewDto>;
    changeStatus(reviewId: string, userId: string, week: string, status: string): Promise<void>;
    updateScore(reviewId: string, practical: number, theory: number, result: string) : Promise<void>
    searchReviews(keyword: string, sort: string, order: number, date: string, status: string, batchIds: string[], skip: number): Promise<IReviewDto[]>;
}
