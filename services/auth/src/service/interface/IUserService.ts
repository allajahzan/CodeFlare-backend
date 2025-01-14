import { IUserLoginResponse, IUserRegisterResponse, IRefreshTokenResponse } from "../../dto/userServiceDto";

/** Interface for User Service */
export interface IUserService {
    userLogin(email: string, password: string): Promise<IUserLoginResponse>;
    userRegister(email: string, password: string, role: string): Promise<IUserRegisterResponse>;
    refreshToken(token: string): Promise<IRefreshTokenResponse>
}
