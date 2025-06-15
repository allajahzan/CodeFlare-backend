import { Document, Schema } from "mongoose";

/** Interface for Attendence Schema */
export interface IAttendenceSchema extends Document {
    userId: Schema.Types.ObjectId;
    batchId: Schema.Types.ObjectId,
    date: Date;
    checkIn: string;
    checkOut: string;
    status: string;
    isApproved: boolean;
    reason: {
        time: string;
        description: string;
    };
    report: {
        time: string;
        description: string;
    };
    selfies: boolean[];
}
