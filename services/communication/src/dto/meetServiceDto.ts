import { Schema } from "mongoose";
import { IUser } from "./chatServiceDto";

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
    host: IUser;
    roomId: string;
    invitedUsers: Schema.Types.ObjectId[];
    messages: IMessage[];
}
