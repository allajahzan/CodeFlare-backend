import { Document } from "mongoose";

/** Interface for User Schema */
export interface IUserSchema extends Document {
    email: string;
    password: string;
    role: string;
    otp: string,
    isblock: boolean;
}
