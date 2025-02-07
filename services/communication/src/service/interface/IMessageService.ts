import { ObjectId } from "mongoose";
import { IMessageSchema } from "../../entities/IMessageSchema";

/** Interface for Message Service */
export interface IMessageService {
    getMessages(chatId: string): Promise<IMessageSchema[] | null>;
}
