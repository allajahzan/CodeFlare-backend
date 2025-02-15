import { Document, Schema } from "mongoose";

/** Interface for User Schema */
export interface IUserSchema extends Document {
    name: string;
    email: string;
    password: string;
    profilePic: string;
    role: string;
    week: string;
    batch: string;
    batches: string[];
    lastActive: Date;
    isblock: boolean;
    isTokenValid: boolean;
    createdAt: Date;
}
