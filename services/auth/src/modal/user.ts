import { Schema, model } from "mongoose";
import { IUserSchema } from "./interface/IUserSchema";

/** Implementaion of User Schema */
const userSchema = new Schema<IUserSchema>({
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
        default : false
    },
});

const User = model<IUserSchema>("User", userSchema);
export default User;
