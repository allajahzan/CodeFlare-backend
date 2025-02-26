import { Document, Schema } from "mongoose";

/** Interface for Review Schema */
export interface IReviewSchema extends Document {
    userId: Schema.Types.ObjectId;
    batchId: Schema.Types.ObjectId;
    title: string;
    week: string;
    date: Date;
    time: string;
    rating: number;
    feedback: string;
    pendings: string[];
    score: {
        tech: number;
        theory: number;
    };
    status: string;
    result: string;
}
