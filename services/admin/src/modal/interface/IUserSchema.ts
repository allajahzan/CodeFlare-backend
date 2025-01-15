import { Document } from "mongoose";

/** Inteface for User Schema */
export interface IUserSchema extends Document {
    profilePic: string;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    batches: string[];
    isblock: boolean;
}
