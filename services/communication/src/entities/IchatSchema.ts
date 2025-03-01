import { Document, ObjectId, Schema } from "mongoose";

/** Interface for Chat Schema */
export interface IChatSchema extends Document {
    participants: Schema.Types.ObjectId[];
    content: string;
    lastMessage: string;
    count: number;
    updatedAt: Date;
}
