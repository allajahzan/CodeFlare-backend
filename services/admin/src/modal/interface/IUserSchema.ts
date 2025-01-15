/** Inteface for User Schema */

import { Document } from "mongoose";

export interface IUserSchema extends Document {
    profilePic: string;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    batches: string[];
    isblock: boolean;
}
