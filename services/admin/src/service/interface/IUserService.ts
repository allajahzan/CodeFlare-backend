import { IGetUserResponse, IGetUsersResponse } from "../../dto/userServiceDto";
import { IUserSchema } from "../../modal/interface/IUserSchema";

/** Interface for User Service */
export interface IUserService {
    createUser(user: IUserSchema): Promise<IGetUserResponse>;
    updateUser(_id: string,user: IUserSchema): Promise<IGetUserResponse>;
    changeUserStatus(_id: string): Promise<IGetUserResponse>;
    searchUsers(query: string): Promise<IGetUsersResponse>;
}
