import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Service */
export interface IReviewService {
    scheduleReview(data: Partial<IReviewSchema>): Promise<Partial<IReviewDto>>;
    updateReview(data: Partial<IReviewSchema>, reviewId: string): Promise<IReviewDto>;
}
