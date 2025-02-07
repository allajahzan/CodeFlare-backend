import { BaseRepository } from "@codeflare/common";
import { IMessageSchema } from "../../entities/IMessageSchema";
import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";
import { IMessageRepository } from "../interface/IMessageRepository";

/** Implementation of Message Repository */
export class MessageRepository extends BaseRepository<IMessageSchema> implements IMessageRepository {
    /**
     * Constructs an instance of MessageRepository.
     * @param model - The Mongoose model for the Message schema.
     */
    constructor(model: Model<IMessageSchema>) {
        super(model);
    }

    /**
     * Finds a single document in the message collection that matches the given query and updates it with the specified data.
     * @param query - The filter query to identify the document to be updated.
     * @param data - The update data to apply to the matched document.
     * @param option - Optional query options to customize the update operation.
     * @returns A promise that resolves to the updated message document if successful, otherwise null if the update fails.
     */
    async findOneAndUpdate(
        query: FilterQuery<IMessageSchema>,
        data: UpdateQuery<IMessageSchema>,
        option?: QueryOptions
    ): Promise<IMessageSchema | null> {
        try {
            return await this.model.findOneAndUpdate(query, data, option);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Retrieves the list of messages for a chat with id `chatId` by retrieving the last 20 messages in descending order of their updated time.
     * @param chatId - The id of the chat to retrieve messages for.
     * @param skip - The skip value for pagination.
     * @returns A promise that resolves to the list of message documents or null if no messages are found.
     * @throws An error if there is a problem retrieving the messages.
     */
    async findLast_20_Messages(
        chatId: string,
        skip: number
    ): Promise<IMessageSchema[] | null> {
        try {
            return (
                await this.model
                    .find({ chatId })
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(20)
            ).reverse();
        } catch (err: unknown) {
            return null;
        }
    }
}
