import { Schema, model } from "mongoose";
import { IuserSchema } from "../modal/IuserSchema";

const userSchema = new Schema<IuserSchema>({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    isblock: {
        type: Boolean,
        required: true,
    },
});

const User = model<IuserSchema>("User", userSchema);
export default User;
