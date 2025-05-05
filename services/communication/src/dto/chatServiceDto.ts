import {
    IBatch,
    IDomain,
    IRole,
    IStudentCategory,
    IWeek,
} from "@codeflare/common";

// Interface for chatUser
export interface IChatUser {
    _id: string;
    name: string;
    email: string;
    phoneNo?: string;
    role: string;
    profilePic: string;
    week?: IWeek;
    domain?: IDomain;
    batch?: IBatch;
    batches?: IBatch[];
    category?: IStudentCategory;
    lastActive?: Date;
    createdAt: Date;
    isBlock: boolean;
}

/** Dto for chats */
export interface IChatDto {
    _id: string;
    participants: string[];
    sender: IChatUser;
    receiver: IChatUser;
    content: string;
    lastMessage: string;
    updatedAt: Date;
}
