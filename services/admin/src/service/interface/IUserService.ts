import { IUserDto } from "../../dto/userServiceDto";
import { IUserSchema } from "../../modal/interface/IUserSchema";

/** Interface for User Service */
export interface IUserService {
    getUsers() : Promise<IUserDto[]>;
    createUser(user: IUserSchema): Promise<IUserDto>;
    updateUser(_id: string,user: IUserSchema): Promise<IUserDto>;
    changeUserStatus(_id: string): Promise<IUserDto>;
    searchUsers(query: string): Promise<IUserDto[]>;
}
