import { IUserSchema } from "../modal/interface/IUserSchema";

/** Interface for userLogin response */
export interface IUserLoginResponse {
    refreshToken: string;
    accessToken: string;
}

/** Interface for userRegister response */
export interface IUserRegisterResponse {
    newUser: IUserSchema;
}

/** Interface for refreshToken response */
export interface IRefreshTokenResponse {
    accessToken: string;
}
