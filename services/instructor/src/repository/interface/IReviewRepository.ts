import { IBaseRepository } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Repository */
export interface IReviewRepository extends IBaseRepository<IReviewSchema> {
    findReviewsWithLimit(userId: string, week: string, limit: number): Promise<IReviewSchema[] | null>
    searchReviews(keyword: string, sort: string, order: number, date: string, status: string, batchIds: string[], skip: number): Promise<IReviewSchema[] | null>
}
