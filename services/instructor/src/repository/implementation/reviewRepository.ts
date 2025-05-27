import { BaseRepository, IReveiewCategory } from "@codeflare/common";
import { IReviewSchema } from "../../entities/IReviewSchema";
import { IReviewRepository } from "../interface/IReviewRepository";
import { Model, Types } from "mongoose";

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
        category?: IReveiewCategory | "",
        limit?: number
    ): Promise<IReviewSchema[] | null> {
        try {
            const pipeline: any[] = [
                {
                    $match: {
                        studentId: new Types.ObjectId(studentId),
                        ...(weekId && { weekId: new Types.ObjectId(weekId) }),
                        ...(category && { category })
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
        category: IReveiewCategory,
        skip: number
    ): Promise<IReviewSchema[] | null> {
        try {
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
                        ...(date && {
                            $expr: {
                                $eq: [
                                    { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                                    new Date(date).toISOString().split("T")[0],
                                ],
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
