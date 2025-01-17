import { Document } from "mongoose";

/** Inteface for Admin Schema */
export interface IAdminSchema extends Document {
    profilePic: string,
    name: string, 
    email: string,
    role: string
}