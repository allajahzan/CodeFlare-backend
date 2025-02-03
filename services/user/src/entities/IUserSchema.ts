import { Document, ObjectId } from "mongoose";

/** Interface for Base User Schema */
export interface IUserSchema extends Document {
    coordinatorId: ObjectId;
    instructorId: ObjectId;
    name: string;
    email: string;
    phoneNo: string;
    password: string;
    profilePic: string;
    role: string;
    week: string;
    batch: string;
    batches: string[];
    lastActive: Date;
    isVerify: boolean;
    isblock: boolean;
    isTokenValid: boolean;
    createdAt: Date;
}
