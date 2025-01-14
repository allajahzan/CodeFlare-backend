import { Document } from "mongoose";
export interface IUserSchema extends Document {
    email: string;
    password: string;
    role: string;
    isblock: boolean;
}
