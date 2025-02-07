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
        sender: {
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
                index: true,
            },
            name: { type: String, required: true },
            email: { type: String, required: true },
            role: { type: String, required: true },
            profilePic: { type: String },
        },
        receiver: {
            _id: {
                type: Schema.Types.ObjectId,
                required: true,
                index: true,
            },
            name: { type: String, required: true },
            email: { type: String, required: true },
            role: { type: String, required: true },
            profilePic: { type: String },
        },
        content: {
            type: String,
            enum: ["text", "image", "file"],
            required: true,
        },
        lastMessage: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Chat = model<IChatSchema>("Chat", chatSchema);
export default Chat;
