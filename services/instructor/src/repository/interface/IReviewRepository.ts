import { IBaseRepository } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Repository */
export interface IReviewRepository extends IBaseRepository<IReviewSchema> {
    searchReviews(keyword: string, sort: string, order: number, date: string, status: string, batchIds: string[], skip: number): Promise<IReviewSchema[] | null>
}
