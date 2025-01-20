import { IUserLoginDto, IUserRegisterDto, IRefreshTokenDto } from "../../dto/userServiceDto";

/** Interface for User Service */
export interface IUserService {
<<<<<<< Updated upstream
    userLogin(email: string, password: string): Promise<IUserLoginDto>;
    userRegister(email: string, password: string, role: string): Promise<IUserRegisterDto>;
=======
    userLogin(email: string, password: string, role:string): Promise<IUserLoginDto>;
    userRegister(email: string, role: string): Promise<IUserRegisterDto>;
    userVerifyEmail(email:string, role:string) :  Promise<void>
>>>>>>> Stashed changes
    refreshToken(token: string): Promise<IRefreshTokenDto>
}
