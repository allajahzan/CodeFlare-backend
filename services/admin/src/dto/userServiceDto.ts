import { IUserSchema } from "../modal/interface/IUserSchema";


/** Interface for Get Users Response */
export interface IGetUsersResponse {
    users: IUserSchema[];
}

/** Interface for Find User Response */
export interface IFindUserResponse {
    user: IUserSchema;
}
