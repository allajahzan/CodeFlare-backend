import { IUserSchema } from "../modal/interface/IUserSchema";

/** DTO for retrieving user data  */
export interface IUserDto {
    profilePic: string;
    name: string;
    email: string;
    phoneNo: string;
    role: string;
    batches: string[];
    isblock: boolean;
}
