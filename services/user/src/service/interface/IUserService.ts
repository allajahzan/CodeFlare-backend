import { IUserLoginDto, IUserRegisterDto, IRefreshTokenDto, IUserDto } from "../../dto/userServiceDto";
import { IUserSchema } from "../../entities/IUserSchema";

/** Interface for User Service */
export interface IUserService {
    // Athentication related methods
    userLogin(email: string, password: string, role: string): Promise<IUserLoginDto>;
    userRegister(name: string, email: string, role: string, password: string): Promise<IUserRegisterDto>;
    userVerifyEmail(email: string, role: string): Promise<void>
    checkResetPasswordLink(token: string): Promise<void>
    userResetPassword(password: string, token: string): Promise<void>
    refreshToken(token: string): Promise<IRefreshTokenDto>

    // User CRUD related methods
    getUser(userQuery: string): Promise<IUserDto>;
    getUsers(tokenPayload?: string, status?: string): Promise<IUserDto[]>;
    searchUsers(tokenPayload: string, keyword: string, isBlocked: string, sort: string, order: number, category: string, batchId: string): Promise<IUserDto[]>
    createUser(user: Partial<IUserSchema>, tokenPayload: string): Promise<IUserDto>;
    updateUser(_id: string, user: Partial<IUserSchema>): Promise<IUserDto>;
    changeUserStatus(_id: string): Promise<void>;
}
