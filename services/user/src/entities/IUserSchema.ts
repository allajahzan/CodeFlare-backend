import { IRole, IStudentCategory } from "@codeflare/common";
import { Document, Schema } from "mongoose";

/** Interface for User Schema */
export interface IUserSchema extends Document {
    name: string;
    email: string;
    phoneNo: string;
    password: string;
    profilePic: string;
    role: IRole;
    week: string;
    domain: string;
    batch: Schema.Types.ObjectId;
    batches: Schema.Types.ObjectId[];
    category: IStudentCategory
    lastActive: Date;
    isTokenValid: boolean;
    isBlock: boolean;
    createdAt: Date;
}
