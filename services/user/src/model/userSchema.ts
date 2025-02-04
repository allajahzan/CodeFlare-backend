import { model, Schema } from "mongoose";
import { IUserSchema } from "../entities/IUserSchema";

/** Implementaion of Base User Schema */
const userSchema = new Schema<IUserSchema>(
    {
        coordinatorId: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        instructorId: {
            type: Schema.Types.ObjectId,
            required: false,
        },  
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
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
        },
        role: {
            type: String,
            required: true,
        },
        week: {
            type: String,
            required: false,
        },
        batch: {
            type: String,
            required: false,
        },
        batches: {
            type: [String],
            required: false,
        },
        lastActive: {
            type: Date,
            required: false,
        },
        isVerify: {
            type: Boolean,
            required: false,
        },
        isblock: {
            type: Boolean,
            default: false,
        },
        isTokenValid: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const User = model<IUserSchema>("User", userSchema);
export default User;
