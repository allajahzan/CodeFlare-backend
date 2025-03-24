import { Document, Schema } from "mongoose";

// Interface for ISelfie
export interface ISelfie {
    name: string;
    time: string;
    photo: string;
    location: string;
    isVerified: boolean;
}

/** Interface for Attendence Schema */
export interface IAttendenceSchema extends Document {
    userId: Schema.Types.ObjectId;
    batchId: Schema.Types.ObjectId,
    date: Date;
    checkIn: string;
    checkOut: string;
    status: string;
    isApproved: boolean;
    isPartial: boolean;
    reason: {
        time: string;
        description: string;
    };
    selfies: ISelfie[];
}
