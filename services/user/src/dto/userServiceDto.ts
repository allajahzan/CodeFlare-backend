import { IBatch, IRole, IStudentCategory } from "@codeflare/common";

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

/** Dto for user */
export interface IUserDto {
    _id: string | unknown;
    name: string;
    email: string;
    phoneNo?: string;
    profilePic: string;
    role: IRole;
    week?: string;
    domain?: string;
    batch?: IBatch | null;
    batches?: IBatch[];
    category?: IStudentCategory;
    lastActive?: Date;
    isBlock: boolean;
    createdAt: Date;
}
