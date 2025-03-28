import { Schema } from "mongoose";

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

/** Dto for refreshToken */
export interface IRefreshTokenDto {
    accessToken: string;
}

/** Dto for User */
interface IBatch {
    _id: string;
    name: string;
}
export interface IUserDto {
    _id: string| unknown;
    name: string;
    email: string;
    phoneNo?: string;
    role: string;
    profilePic?: string;
    batches?: IBatch[];
    batch?: IBatch| null;
    week?: string;
    lastActive?: Date;
    createdAt: Date;
    isBlock?: boolean;
    qrCode?: string;
}