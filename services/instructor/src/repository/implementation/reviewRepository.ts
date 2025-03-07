import { BaseRepository } from "@codeflare/common";
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
     * @param userId - The id of the user to retrieve reviews for.
     * @param week - The week to retrieve reviews for.
     * @param limit - The maximum number of reviews to retrieve.
     * @returns A promise that resolves to a list of review schema, or null if there is a problem retrieving the reviews.
     */
    async findReviewsWithLimit(
        userId: string,
        week: string,
        limit: number
    ): Promise<IReviewSchema[] | null> {
        try {
            return await this.model.aggregate([
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        week: week,
                    },
                },
                {
                    $sort: {
                        updatedAt: -1,
                    },
                },
                {
                    $limit: limit,
                },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Searches for reviews based on the given keyword from the request query.
     * @param keyword - The keyword to search for in the review's week.
     * @param sort - The field to sort the results by.
     * @param order - The order of the sorting, either ascending (1) or descending (-1).
     * @param status - The status of the reviews to search for, either "pending" or "completed".
     * @param batchIds - The list of batchIds to search for reviews in.
     * @returns A promise that resolves to an array of reviews matching the search criteria if successful, otherwise null.
     */
    async searchReviews(
        keyword: string,
        sort: string,
        order: number,
        date: string,
        status: string,
        batchIds: string[],
        skip: number
    ): Promise<IReviewSchema[] | null> {
        try {
            return await this.model.aggregate([
                {
                    $match: {
                        ...(batchIds && {
                            batchId: { $in: batchIds.map((id) => new Types.ObjectId(id)) },
                        }),
                        ...(keyword && {
                            $or: [
                                { week: keyword.toLowerCase() },
                                { title: { $regex: keyword.toLowerCase(), $options: "i" } },
                            ],
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
                {
                    $skip: skip,
                },
                {
                    $limit: 10,
                },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }
}
