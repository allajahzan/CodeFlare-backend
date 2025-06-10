import { Document, Schema } from "mongoose";

// Interface for ISelfie
export interface ISelfie {
    name: string;
    photo: string;
    time: string;
    location: string;
    isVerified: boolean;
}

/** Interface for Snapshot Schema */
export interface ISnapshotSchema extends Document {
    attendenceId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    name: string;
    photo: string;
    time: string;
    location: string;
    isVerified: boolean;
}