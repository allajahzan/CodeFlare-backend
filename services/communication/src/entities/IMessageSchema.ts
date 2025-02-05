import { Document, Schema } from "mongoose";

/** Interface for Message Schema */
export interface IMessageSchema extends Document {
    senderId: Schema.Types.ObjectId;
    receiverId: Schema.Types.ObjectId;
    chatId : Schema.Types.ObjectId;
    message: string;
    createdAt: Date;
}