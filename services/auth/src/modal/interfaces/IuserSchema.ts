import { Document } from "mongoose";
export interface IuserSchema extends Document {
    email: string;
    password: string;
    role: string;
    isblock: boolean;
}
