import { IBaseRepository, IReviewCategory } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";

/** Interface for Review Repository */
export interface IReviewRepository extends IBaseRepository<IReviewSchema> {
    findReviewsWithLimit(studentId: string, weekId?: string, category?: IReviewCategory | "", limit?: number, status?: string): Promise<IReviewSchema[] | null>
    searchReviews(instructorId: string,batchId: string, studentId: string, domainId: string, weekId: string, sort: string, order: number, date: string, status: string, category: IReviewCategory, skip: number): Promise<IReviewSchema[] | null>
}
