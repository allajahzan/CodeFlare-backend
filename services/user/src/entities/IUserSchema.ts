import { IReviewCategory, IRole, IStudentCategory } from "@codeflare/common";
import { Document, Schema } from "mongoose";

/** Interface for User Schema */
export interface IUserSchema extends Document {
    name: string;
    email: string;
    phoneNo: string;
    password: string;
    profilePic: string;
    role: IRole;
    week: Schema.Types.ObjectId;
    domain: Schema.Types.ObjectId;
    batch: Schema.Types.ObjectId;
    batches: Schema.Types.ObjectId[];
    category: IStudentCategory;
    review: IReviewCategory;
    lastActive: Date;
    isTokenValid: boolean;
    isBlock: boolean;
    createdAt: Date;
}
