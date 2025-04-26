import { Schema, model } from "mongoose";
import { INotificationSchema } from "../entities/INotification";

/** Implementation of Notification Schema */
const NotificationSchema = new Schema<INotificationSchema>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: false,
            default: Date.now,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = model("Notification", NotificationSchema);
export default Notification;
