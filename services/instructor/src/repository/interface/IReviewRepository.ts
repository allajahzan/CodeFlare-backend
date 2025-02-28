import { IBaseRepository } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Repository */
export interface IReviewRepository extends IBaseRepository<IReviewSchema> {
    searchReviews(keyword: string, sort: string, order: number, status: string, batchIds: string[]): Promise<IReviewSchema[] | null>
}
