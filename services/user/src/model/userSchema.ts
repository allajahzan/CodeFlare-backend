import { model, Schema } from "mongoose";
import { IUserSchema } from "../entities/IUserSchema";

/** Implementaion of Base User Schema */
const userSchema = new Schema<IUserSchema>(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            index: true,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: false,
        },
        profilePic: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            required: true,
            index: true,
        },
        week: {
            type: String,
            required: false,
        },
        stage: {
            type: String,
            enum: ["Normal", "Hold", "Intake", "QA"],
            default: "Normal",
            required: false,
        },
        category: {
            type: String,
            enum: ["Ongoing", "Placement", "Critical"],
            default: "Ongoing",
            required: false,
        },
        // status: {
        //     type: String,
        //     enum: ["Top", "Middle", "Bottom"],
        //     default: "Top",
        //     required: false,
        // },
        batch: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        batches: {
            type: [Schema.Types.ObjectId],
            required: false,
        },
        lastActive: {
            type: Date,
            required: false,
        },
        isblock: {
            type: Boolean,
            default: false,
            index: true,
        },
        isTokenValid: {
            type: Boolean,
            default: true,
        },
        qrCode: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);

const User = model<IUserSchema>("User", userSchema);
export default User;
