import { BaseRepository } from "@codeflare/common";
import { IChatRepository } from "../interface/IChatRepository";
import { IChatSchema } from "../../entities/IChatSchema";
import {
    FilterQuery,
    Model,
    QueryOptions,
    UpdateQuery,
    ObjectId,
} from "mongoose";

/** Implementation for Chat Repository */
export class ChatRepository extends BaseRepository<IChatSchema> implements IChatRepository {
    /**
     * Creates a new instance of the ChatRepository
     * @param model - Mongoose model for ChatSchema
     */
    constructor(model: Model<IChatSchema>) {
        super(model);
    }

    /**
     * Finds a single document in the chat collection that matches the given query and updates it with the specified data.
     * @param query - The filter query to identify the document to be updated.
     * @param data - The update data to apply to the matched document.
     * @param option - Optional query options to customize the update operation.
     * @returns A promise that resolves to the updated chat document if successful, or null if the update fails.
     */
    async findOneAndUpdate(
        query: FilterQuery<IChatSchema>,
        data: UpdateQuery<IChatSchema>,
        option?: QueryOptions
    ): Promise<IChatSchema | null> {
        try {
            return await this.model.findOneAndUpdate(query, data, option);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Retrieves the list of chats for a user with id `_id`.
     * @param userId - The id of the user to retrieve chats for.
     * @returns A promise that resolves to an array of chat documents or null if no chats are found.
     * @throws An error if there is a problem retrieving the chats.
     */
    async getChatsByUserId(userId: string): Promise<IChatSchema[] | null> {
        try {
            return await this.model
                .find({ participants: userId as unknown as ObjectId })
                .sort({ updatedAt: -1 });
        } catch (err: unknown) {
            return null;
        }
    }
}
