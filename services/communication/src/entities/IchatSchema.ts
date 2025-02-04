import { ObjectId, Schema } from "mongoose";

/** Interface for Chat Schema */
export interface IChatSchema {
    participants: Schema.Types.ObjectId[];
    lastMessage: string;
    updatedAt: Date;
}
