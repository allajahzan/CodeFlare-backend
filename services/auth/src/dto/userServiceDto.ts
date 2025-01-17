import { IUserSchema } from "../modal/interface/IUserSchema";

/** Dto for userLogin */
export interface IUserLoginDto {
    refreshToken: string;
    accessToken: string;
}

/** Dto for userRegister */
export interface IUserRegisterDto {
    email: string;
    role: string;
}

/** Dto for refreshToken */
export interface IRefreshTokenDto {
    accessToken: string;
}
