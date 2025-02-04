import { BaseRepository } from "@codeflare/common";
import { IChatRepository } from "../interface/IChatRepository";
import { IChatSchema } from "../../entities/IChatSchema";
import { Model } from "mongoose";

/** Implementation for Chat Repository */
export class ChatRepository extends BaseRepository<IChatSchema> implements IChatRepository {
    /**
     * Creates a new instance of the ChatRepository
     * @param model - Mongoose model for ChatSchema
     */
    constructor(model: Model<IChatSchema>) {
        super(model);
    }
}
