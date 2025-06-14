import { IReviewCategory } from "@codeflare/common";
import { IReviewDto } from "../../dto/reviewService";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Service */
export interface IReviewService {
    getScheduledReviews(studentId: string, weekId: string, status?: string, result?: string) : Promise<IReviewDto[]>
    scheduleFoundationReview(tokenPayload: string, data: Partial<IReviewSchema>): Promise<void>;
    scheduleReview(tokenPayload: string, data: Partial<IReviewSchema>): Promise<Partial<IReviewDto>>;
    updateReview(tokenPayload: string, data: Partial<IReviewSchema>, reviewId: string): Promise<IReviewDto>;
    changeStatus(tokenPayload: string, reviewId: string, status: string): Promise<{_id: string} | null>;
    updateScore(tokenPayload: string, reviewId: string, practical: number, theory: number) : Promise<IReviewDto | void>
    searchReviews(tokenPayload: string,batchId: string, studentId: string, domainId: string, weekId: string, sort: string, order: number, date: string, status: string, category: IReviewCategory, skip: number): Promise<IReviewDto[]>;
}
