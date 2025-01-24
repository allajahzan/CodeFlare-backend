/** Dto for userLogin */
export interface IUserLoginDto {
    role: string;
    refreshToken: string;
    accessToken: string;
}

/** Dto for userRegister */
export interface IUserRegisterDto {
    email: string;
    role: string;
}

export interface IUserDto {
    _id: string;
    name: string;
    email: string;
    phoneNo?: string;
    role: string;
    batches?: string[];
    batch?: string;
    week?: string;
    lastActive?: Date;
    createdAt: Date;
}

/** Dto for refreshToken */
export interface IRefreshTokenDto {
    accessToken: string;
}
