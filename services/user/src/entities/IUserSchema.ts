import { Document, Schema } from "mongoose";

/** Interface for User Schema */
export interface IUserSchema extends Document {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    profilePic: string;
    role: string;
    week: string;
    batch: Schema.Types.ObjectId;
    batches: Schema.Types.ObjectId[];
    lastActive: Date;
    isblock: boolean;
    isTokenValid: boolean;
    createdAt: Date;
}
