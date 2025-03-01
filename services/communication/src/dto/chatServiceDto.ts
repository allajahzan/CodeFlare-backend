import { Schema } from "mongoose";

/** Interface for user */
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    profilePic: string;
}

/** Dto for chats */
export interface IChatDto {
    _id: Schema.Types.ObjectId;
    participants: string[];
    sender: IUser;
    receiver: IUser;
    content: string;
    lastMessage: string;
}
