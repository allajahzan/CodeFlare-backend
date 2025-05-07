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
        phoneNo: {
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
            default: "",
        },
        role: {
            type: String,
            enum: ["admin", "coordinator", "instructor", "student"],
            required: true,
            index: true,
        },
        week: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        domain: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        batch: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        batches: {
            type: [Schema.Types.ObjectId],
            required: false,
        },
        category: {
            type: String,
            enum: [
                "Foundation",
                "Ongoing",
                "Held",
                "Critical",
                "Terminated",
                "Placement",
                "Placed",
            ],
            required: false,
        },
        lastActive: {
            type: Date,
            required: false,
        },
        isTokenValid: {
            type: Boolean,
            default: true,
        },
        isBlock: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

const User = model<IUserSchema>("User", userSchema);
export default User;
