import { Schema, model } from "mongoose";
import { IUserSchema } from "./interface/IUserSchema";

/** Implementaion of User Schema */
const userShema = new Schema<IUserSchema>({
    profilePic: {
        type: String,
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
    role: {
        type: String,
        required: true,
    },
    batches: {
        type: [String],
        required: true,
    },
    isblock: {
        type: Boolean,
        default: false,
    },
});

const User = model<IUserSchema>("User", userShema);
export default User;
