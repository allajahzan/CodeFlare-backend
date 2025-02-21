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
        phoneNumber : {
            type: String,
            required : false
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
    },
    { timestamps: true }
);

const User = model<IUserSchema>("User", userSchema);
export default User;
