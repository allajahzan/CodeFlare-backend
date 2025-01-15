import { IFindUserResponse, IGetUsersResponse } from "../../dto/userServiceDto";
import { IUserSchema } from "../../modal/interface/IUserSchema";

/** Interface for User Service */
export interface IUserService {
    createUser(user: IUserSchema): Promise<IFindUserResponse>;
    updateUser(_id: string,user: IUserSchema): Promise<IFindUserResponse>;
    changeUserStatus(_id: string): Promise<IFindUserResponse>;
    searchUsers(query: string): Promise<IGetUsersResponse>;
}
