import { BaseRepository } from "@codeflare/common";
import { IBatchSchema } from "../../entities/IBatchSchema";
import { Model } from "mongoose";
import { IBatchRepository } from "../interface/IBatchRepository";

/** Implementation of Batch Repository */
export class BatchRepository
    extends BaseRepository<IBatchSchema>
    implements IBatchRepository {
    /**
     * Constructs an instance of the BatchRepository
     * @param model - The Mongoose model for the BatchSchema
     */
    constructor(model: Model<IBatchSchema>) {
        super(model);
    }

    /**
     * Searches for batches based on the given keyword from the request query.
     * @param keyword - The keyword to search for in the batch's name.
     * @param sort - The field to sort the results by.
     * @param order - The order of the sorting, either ascending (1) or descending (-1).
     * @returns A promise that resolves to an array of batches matching the search criteria if successful, otherwise null.
     */
    async searchBatch(
        keyword: string,
        sort: string,
        order: number
    ): Promise<IBatchSchema[] | null> {
        try {
            const batches = await this.model.aggregate([
                {
                    $match: keyword
                        ? {
                            $or: [{ name: { $regex: keyword, $options: "i" } }],
                        }
                        : {},
                },
                {
                    $sort: {
                        [sort]: order === 1 ? 1 : -1,
                    },
                },
            ]);

            return batches.length? batches : null
        } catch (err: unknown) {
            return null;
        }
    }
}
