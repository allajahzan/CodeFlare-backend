import { IUserSchema } from "../modal/interface/IUserSchema";

/** Interface for User Login Response */
export interface IUserLoginResponse {
    refreshToken: string;
    accessToken: string;
}

/** Interface for User Resister Response */
export interface IUserRegisterResponse {
    newUser: IUserSchema;
}

/** Interface for refreshToken */
export interface IRefreshTokenResponse {
    accessToken: string;
}
