import { model, Schema } from "mongoose";
import { IMessageSchema } from "../entities/IMessageSchema";

/** Implementation of Message Schema */
const messageSchema = new Schema<IMessageSchema>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Message = model<IMessageSchema>("Message", messageSchema);
export default Message;
