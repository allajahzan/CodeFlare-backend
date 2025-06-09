import { IBaseRepository, IReviewCategory } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { FilterQuery } from "mongoose";

/** Interface for Review Repository */
export interface IReviewRepository extends IBaseRepository<IReviewSchema> {
    findReviewsWithLimit(studentId: string, weekId?: string, category?: { category: FilterQuery<Pick<IReviewSchema, "category">> } | "", limit?: number, status?: string): Promise<IReviewSchema[] | null>
    searchReviews(instructorId: string,batchId: string, studentId: string, domainId: string, weekId: string, sort: string, order: number, date: string, status: string, category: IReviewCategory | "", result: string, skip: number): Promise<IReviewSchema[] | null>
}
