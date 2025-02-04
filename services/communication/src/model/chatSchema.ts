import { model, Schema } from "mongoose";
import { IChatSchema } from "../entities/IChatSchema";

/** Implementation for Chat Schema */
const chatSchema = new Schema<IChatSchema>(
    {
        participants: {
            type: [Schema.Types.ObjectId],
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
