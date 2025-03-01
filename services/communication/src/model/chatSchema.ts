import { Document, Schema, model, Types } from "mongoose";
import { IChatSchema } from "../entities/IChatSchema";

/** Chat Schema */
const chatSchema = new Schema<IChatSchema>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                index: true,
            },
        ],
        content: {
            type: String,
            enum: ["text", "image", "file"],
            required: true,
        },
        lastMessage: {
            type: String,
            required: true,
        },
        count: {
            type: Number,
            default: 1,
        },
    },
    { timestamps: true }
);

const Chat = model<IChatSchema>("Chat", chatSchema);
export default Chat;
