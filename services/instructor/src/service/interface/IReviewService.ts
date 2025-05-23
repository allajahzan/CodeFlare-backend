import { IReveiewCategory } from "@codeflare/common";
import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Service */
export interface IReviewService {
    getScheduledReviews(userId: string) : Promise<IReviewDto[]>
    scheduleReview(tokenPayload: string, data: Partial<IReviewSchema>): Promise<Partial<IReviewDto>>;
    updateReview(tokenPayload: string, data: Partial<IReviewSchema>, reviewId: string): Promise<IReviewDto>;
    changeStatus(tokenPayload: string, reviewId: string, status: string): Promise<void>;
    updateScore(tokenPayload: string, reviewId: string, practical: number, theory: number) : Promise<void>
    searchReviews(tokenPayload: string,batchId: string, studentId: string, domainId: string, weekId: string, sort: string, order: number, date: string, status: string, category: IReveiewCategory, skip: number): Promise<IReviewDto[]>;
}
