import { Schema, model, Types } from "mongoose";
import { IMeetSchema } from "../entities/IMeetSchema";

/** Room Schema */
const meetSchema = new Schema<IMeetSchema>(
    {
        hostId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        roomId: {
            type: String,
            default: function () {
                return "room" + Math.floor(Math.random() * 900000) + "cd-meet";
            },
            unique: true,
            ttl: 60 * 60 * 24,
        },
        invitedUsers: [
            {
                type: Schema.Types.ObjectId,
                required: false,
                index: true,
            },
        ],
        messages: {
            type: [
                {
                    userId: {
                        type: Schema.Types.ObjectId,
                        required: true,
                        index: true,
                    },
                    message: {
                        type: String,
                        required: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            required: false,
            default: [],
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 60 * 24,
        },
    },
);

const Meet = model<IMeetSchema>("Meet", meetSchema);
export default Meet;
