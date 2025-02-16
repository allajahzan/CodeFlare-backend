import { model, Schema } from "mongoose";
import { IProfileSchema } from "../entities/IProfileSchema";

const profileSchema = new Schema<IProfileSchema>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    softSkills: {
        type: String,
        required: true,
    },
    techSkills: {
        type: String,
        required: true,
    },
    work: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
    portfolio: {
        type: String,
        required: true,
    },
    github: {
        type: String,
        required: true,
    },
    linkedin: {
        type: String,
        required: true,
    },
    instagram: {
        type: String,
        required: true,
    },
});

const Profile = model("Profile", profileSchema);
export default Profile;
