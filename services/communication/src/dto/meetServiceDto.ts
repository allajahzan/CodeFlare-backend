import { IStudent, IUser } from "@codeflare/common";
import { Schema } from "mongoose";

// Interface for Message
interface IMessage {
    userId: string;
    message: string;
    createdAt: Date;
}

/** Dto for meet */
export interface IMeetDto {
    _id: string;
    hostId: string;
    host: IUser | IStudent;
    roomId: string;
    invitedUsers: string[];
    messages: IMessage[];
}

/** Dro for roomId */
export interface IRoomIdDto {
    roomId: string;
}