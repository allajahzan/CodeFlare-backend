import { Document, ObjectId, Schema } from "mongoose";

/** Interface for user data */
interface IUser {
    _id: Schema.Types.ObjectId;
    name: string;
    email: string;
    role: string;
    profilePic: string;
}

/** Interface for Chat Schema */
export interface IChatSchema extends Document {
    participants: Schema.Types.ObjectId[];
    sender: IUser;
    receiver: IUser;
    lastMessage: string;
    updatedAt: Date;
}
