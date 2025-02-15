import { Document, Schema } from "mongoose";

/** Interface for Profile Schema */
export interface IProfileSchema extends Document {
    userId: Schema.Types.ObjectId
    bio: string;
    about: string;
    softSkills: string;
    techSkills: string;
    work: string;
    education: string;
    portfolio: string;
    github: string;
    linkedin: string;
    instagram: string;
}
