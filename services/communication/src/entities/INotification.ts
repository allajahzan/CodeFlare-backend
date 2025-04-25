import { Document, Schema } from "mongoose";

/** Interface for Notification Schema */
export interface INotificationSchema extends Document {
    senderId: Schema.Types.ObjectId;
    recieverId: Schema.Types.ObjectId;
    message: string,
    type: string;
    date: Date;
    createdAt: Date;
    isRead: boolean;
}