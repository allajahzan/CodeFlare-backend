import { Schema, model } from "mongoose";
import { IUserSchema } from "./interfaces/IUserSchema";


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
        required: true,
    },
});

const User = model<IUserSchema>("User", userSchema);
export default User;
