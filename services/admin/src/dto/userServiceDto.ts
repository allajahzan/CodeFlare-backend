import { IUserSchema } from "../modal/interface/IUserSchema";


/** Interface for getUsers response */
export interface IGetUsersResponse {
    users: IUserSchema[];
}

/** Interface for getUser response */
export interface IGetUserResponse {
    user: IUserSchema;
}
