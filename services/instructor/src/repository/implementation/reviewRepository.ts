import { BaseRepository, IReviewCategory } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../interface/IReviewRepository";
import { FilterQuery, Model, Types } from "mongoose";

/** Implementation of Review Repository */
export class ReviewRepository
    extends BaseRepository<IReviewSchema>
    implements IReviewRepository {
    /**
     * Constructs an instance of the ReviewRepository.
     * @param model - The mongoose model representing the review schema, used for database operations.
     */
    constructor(model: Model<IReviewSchema>) {
        super(model);
    }

    /**
     * Retrieves the latest reviews of a user for a given week, up to the given limit.
     * @param studentId - The id of the user to retrieve reviews for.
     * @param weekId - The week to retrieve reviews for.
     * @param limit - The maximum number of reviews to retrieve.
     * @returns A promise that resolves to a list of review schema, or null if there is a problem retrieving the reviews.
     */
    async findReviewsWithLimit(
        studentId: string,
        weekId?: string,
        category?: { category: FilterQuery<Pick<IReviewSchema, "category">> } | "",
        limit?: number,
        status?: string
    ): Promise<IReviewSchema[] | null> {
        try {
            const pipeline: any[] = [
                {
                    $match: {
                        studentId: new Types.ObjectId(studentId),
                        ...(weekId && { weekId: new Types.ObjectId(weekId) }),
                        ...(category && category),
                        ...(status && { status }),
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ];

            if (limit) {
                pipeline.push({ $limit: limit });
            }

            return await this.model.aggregate(pipeline);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Searches for reviews based on the given parameters.
     * @param batchId - The id of the batch to search for reviews in.
     * @param studentId - The id of the student to search for reviews from.
     * @param domainId - The id of the domain to search for reviews in.
     * @param weekId - The id of the week to search for reviews in.
     * @param sort - The field to sort the result by.
     * @param order - The order of the sorting, either 1 for ascending or -1 for descending.
     * @param date - The date to search for reviews on.
     * @param status - The status of the reviews to search for, either "true" or "false".
     * @param category - The category of the reviews to search for.
     * @param skip - The number of records to skip in the result set.
     * @returns A promise that resolves to an array of review schema if the reviews are found, otherwise null.
     * @throws An error if there is a problem searching for the reviews.
     */
    async searchReviews(
        instructorId: string,
        batchId: string,
        studentId: string,
        domainId: string,
        weekId: string,
        sort: string,
        order: number,
        date: string,
        status: string,
        category: IReviewCategory | "",
        result: string,
        skip: number
    ): Promise<IReviewSchema[] | null> {
        try {
            let start;
            let end;
            if (date) {
                const inputDate = new Date(date);

                // Start of the day
                start = new Date(inputDate);
                start.setHours(0, 0, 0, 0);

                // End of the day
                end = new Date(inputDate);
                end.setHours(23, 59, 59, 999);
            }

            return await this.model.aggregate([
                {
                    $match: {
                        ...(instructorId && {
                            instructorId: new Types.ObjectId(instructorId),
                        }),
                        ...(batchId && {
                            batchId: new Types.ObjectId(batchId),
                        }),
                        ...(domainId && {
                            domainId: new Types.ObjectId(domainId),
                        }),
                        ...(weekId && {
                            weekId: new Types.ObjectId(weekId),
                        }),
                        ...(studentId && {
                            studentId: new Types.ObjectId(studentId),
                        }),
                        ...(category && {
                            category,
                        }),
                        ...(result && {
                            result,
                        }),
                        ...(date && {
                            date: {
                                $gte: start,
                                $lte: end,
                            },
                        }),
                        ...(status && { status }),
                    },
                },
                {
                    $sort: sort ? { [sort]: order === 1 ? 1 : -1 } : { createdAt: -1 },
                },
                // {
                //     $skip: skip,
                // },
                // {
                //     $limit: 10,
                // },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }
}
