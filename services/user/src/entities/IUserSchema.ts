import { Document } from "mongoose";

/** Interface for Base User Schema */
export interface IUserSchema extends Document {
    name: string;
    email: string;
    phoneNo: string;
    password: string;
    profilePic: string;
    role: string;
    batch: string;
    week: string;
    batches: string[];
    lastActive: Date;
    isVerify: boolean;
    isblock: boolean;
    createdAt: string;
    otp: string;
}
