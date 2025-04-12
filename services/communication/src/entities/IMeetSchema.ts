import { Document, Schema } from "mongoose";

// Interface for Message
interface IMessage {
    userId: string;
    message: string;
    createdAt: Date;
}

/** Interface for Meet Schema */
export interface IMeetSchema extends Document {
    hostId: Schema.Types.ObjectId;
    roomId: string,
    invitedUsers: Schema.Types.ObjectId[];
    messages: IMessage[];
    createdAt: Date
}
