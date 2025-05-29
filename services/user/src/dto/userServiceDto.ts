import { IBatch, IDomain, IReviewCategory, IRole, IStudentCategory, IWeek } from "@codeflare/common";

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
    week?: IWeek | null;
    domain?: IDomain | null;
    batch?: IBatch | null;
    batches?: IBatch[];
    category?: IStudentCategory;
    review?: IReviewCategory;
    lastActive?: Date;
    isBlock: boolean;
    createdAt: Date;
}

/** Dto for user count */
export interface IUsersCount {
    students?: number;
    coordinators?: number;
    instructors?: number;
}