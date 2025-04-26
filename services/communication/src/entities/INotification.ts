import { Document, Schema } from "mongoose";

/** Interface for Notification Schema */
export interface INotificationSchema extends Document {
    senderId: Schema.Types.ObjectId;
    receiverId: Schema.Types.ObjectId;
    message: string,
    type: string;
    path: string;
    date: Date;
    createdAt: Date;
    isRead: boolean;
}