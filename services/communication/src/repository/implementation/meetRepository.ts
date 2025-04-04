import { Model } from "mongoose";
import { IMeetSchema } from "../../entities/IMeetSchema";
import { IMeetRepository } from "../interface/IMeetRepository";
import { BaseRepository } from "@codeflare/common";
import { FilterQuery, UpdateQuery, QueryOptions } from "mongoose";

/** Implementation for Meet Repository */
export class MeetRepository
    extends BaseRepository<IMeetSchema>
    implements IMeetRepository {
    /**
     * Constructor for MeetRepository
     * @param model - The Meet model from Mongoose
     */
    constructor(model: Model<IMeetSchema>) {
        super(model);
    }

    /**
     * Finds a single document in the meet collection that matches the given query and updates it with the specified data.
     * @param query - The filter query to identify the document to be updated.
     * @param data - The update data to apply to the matched document.
     * @param option - Optional query options to customize the update operation.
     * @returns A promise that resolves to the updated meet document if successful, otherwise null if the update fails.
     */
    async findOneAndUpdate(
        query: FilterQuery<IMeetSchema>,
        data: UpdateQuery<IMeetSchema>,
        option?: QueryOptions
    ): Promise<IMeetSchema | null> {
        try {
            return await this.model.findOneAndUpdate(query, data, option);
        } catch (err: unknown) {
            return null;
        }
    }
}
