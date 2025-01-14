import { IRefreshTokenResponse } from "../../dto/userService/IRefreshTokenDto";
import { IUserLoginResponse } from "../../dto/userService/IUserLoginDto";
import { IUserRegisterResponse } from "../../dto/userService/IUserRegisterDto";

/** Interface for User Service */
export interface IUserService {
    userLogin(email: string, password: string): Promise<IUserLoginResponse>;
    userRegister(email: string, password: string, role: string): Promise<IUserRegisterResponse>;
    refreshToken(token: string): Promise<IRefreshTokenResponse>
}
