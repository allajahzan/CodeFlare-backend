import { IUserLoginDto, IUserRegisterDto, IRefreshTokenDto } from "../../dto/userServiceDto";

/** Interface for User Service */
export interface IUserService {
    userLogin(email: string, password: string): Promise<IUserLoginDto>;
    userRegister(email: string, password: string, role: string): Promise<IUserRegisterDto>;
    refreshToken(token: string): Promise<IRefreshTokenDto>
}
