import { Document } from "mongoose";

/** Interface for User Schema */
export interface IUserSchema extends Document {
    email: string;
    password: string;
    role: string;
    token: string;
    otp: string,
    isVerify: boolean;
    isblock: boolean;
}
