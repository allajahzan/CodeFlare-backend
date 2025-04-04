import { Schema } from "mongoose";

// Interface for Message
interface IMessage {
    userId: string;
    message: string;
    createdAt: Date;
}

/** Dto for meet */
export interface IMeetDto {
    _id: Schema.Types.ObjectId;
    hostId: Schema.Types.ObjectId;
    roomId: string;
    invitedUsers: Schema.Types.ObjectId[];
    messages: IMessage[];
}
