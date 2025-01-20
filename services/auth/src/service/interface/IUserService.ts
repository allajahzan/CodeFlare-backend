import { IUserLoginDto, IUserRegisterDto, IRefreshTokenDto } from "../../dto/userServiceDto";

/** Interface for User Service */
export interface IUserService {
    userLogin(email: string, password: string, role:string): Promise<IUserLoginDto>;
    userRegister(email: string, role: string): Promise<IUserRegisterDto>;
    userVerifyEmail(email:string, role:string) :  Promise<void>
    refreshToken(token: string): Promise<IRefreshTokenDto>
}
