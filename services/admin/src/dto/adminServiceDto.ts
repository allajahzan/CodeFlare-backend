import { IAdminSchema } from "../modal/interface/IAdminSchema";

/** Dto for retrieving admin data */
export interface IAdminDto {
    profilePic: string;
    name: string;
    email: string;
    role: string;
}
