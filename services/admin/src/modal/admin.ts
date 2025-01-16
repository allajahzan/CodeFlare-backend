/** Implementation for Admin Schema */

import { model, Schema } from "mongoose";
import { IAdminSchema } from "./interface/IAdminSchema";

const adminSchema = new Schema<IAdminSchema>({
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
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
})

const Admin = model<IAdminSchema>('Admin', adminSchema);
export default Admin