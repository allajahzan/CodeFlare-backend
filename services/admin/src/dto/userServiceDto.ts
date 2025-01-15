import { IUserSchema } from "../modal/interface/IUserSchema";

/** Interface for Get Users Response */
export interface IGetUsersResponse {
    users: IUserSchema[];
}

/** Interface for Block/Unblock User Response */
export interface IBlockUserResponse {
    user: IUserSchema;
}
