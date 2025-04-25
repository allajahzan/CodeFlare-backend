import { Schema, model } from "mongoose";

/** Implementation of Notification Schema */
const NotificationSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        recieverId: {
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
        date: {
            type: Date,
            required: true,
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
