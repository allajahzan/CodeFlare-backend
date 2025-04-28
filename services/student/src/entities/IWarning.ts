import { Document, Schema as MongooseSchema } from "mongoose";

// Interface for replay
export interface IReply {
    message: string;
    date: Date;
}

/** Interface for Warning Schema */
export interface IWarningSchema extends Document {
    studentId: MongooseSchema.Types.ObjectId;
    coordinatorId: MongooseSchema.Types.ObjectId;
    message: string;
    date: Date;
    reply?: IReply[];
    createdAt: Date;
}
