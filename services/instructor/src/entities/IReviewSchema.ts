import { Document, Schema } from "mongoose";

/** Interface for Review Schema */
export interface IReviewSchema extends Document {
    instructorId: Schema.Types.ObjectId;
    studentId: Schema.Types.ObjectId;
    batchId: Schema.Types.ObjectId;
    domainId: Schema.Types.ObjectId;
    weekId: Schema.Types.ObjectId;
    title: string;
    date: Date;
    time: string;
    category: string;
    feedback: string;
    pendings: string[];
    score: { practical: number; theory: number };
    status: string;
    result: string;
    rating: number;
    updatedAt: Date;
}