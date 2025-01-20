import { IUserLoginDto, IUserRegisterDto, IRefreshTokenDto } from "../../dto/userServiceDto";

/** Interface for User Service */
export interface IUserService {
    userLogin(email: string, password: string, role:string): Promise<IUserLoginDto>;
    userRegister(_id: string,email: string, role: string, token: string): Promise<IUserRegisterDto>;
    userVerifyEmail(email:string, role:string) :  Promise<void>
    refreshToken(token: string): Promise<IRefreshTokenDto>
}
