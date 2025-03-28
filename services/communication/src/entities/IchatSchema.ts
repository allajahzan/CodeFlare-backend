import { Document, Schema } from "mongoose";

/** Interface for Chat Schema */
export interface IChatSchema extends Document {
    participants: Schema.Types.ObjectId[];
    content: string;
    lastMessage: string;
    updatedAt: Date;
}