import { IBaseRepository, IReveiewCategory } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Repository */
export interface IReviewRepository extends IBaseRepository<IReviewSchema> {
    findReviewsWithLimit(studentId: string, week?: string, limit?: number): Promise<IReviewSchema[] | null>
    searchReviews(batchId: string, studentId: string, domainId: string, weekId: string, sort: string, order: number, date: string, status: string, category: IReveiewCategory, skip: number): Promise<IReviewSchema[] | null>
}
