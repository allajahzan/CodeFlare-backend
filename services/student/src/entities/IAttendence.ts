import { Document, Schema } from "mongoose";

// Interface for ISelfie
export interface ISelfie {
    name: string;
    time: Date;
    photo: string;
    location: string;
    isVerified: boolean;
}

/** Interface for Attendence Schema */
export interface IAttendenceSchema extends Document {
    userId: Schema.Types.ObjectId;
    date: Date;
    checkIn: Date;
    checkOut: Date;
    status: string;
    isApproved: boolean;
    isPartial: boolean;
    reason: {
        time: Date;
        description: string;
    };
    selfies: ISelfie[];
}
