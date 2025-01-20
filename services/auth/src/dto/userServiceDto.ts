/** Dto for userLogin */
export interface IUserLoginDto {
<<<<<<< Updated upstream
=======
    role: string;
>>>>>>> Stashed changes
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
