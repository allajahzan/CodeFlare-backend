import { IBatch, IStudent, IUser } from "@codeflare/common";
import { ISelfie } from "../entities/IAttendence";
import { IWarningDto } from "./warningDto";

/** Dto for CheckIn */
export interface ICheckInOutDto {
    userId: string;
    date: Date;
    checkIn?: string;
    checkOut?: string;
    status: string;
}

/** Dto for Attendence */
export interface IAttendenceDto {
    _id: string;
    userId: string;
    user?: IUser | IStudent
    batchId: string;
    batch?: IBatch;
    date: Date;
    checkIn: string;
    checkOut: string;
    status: string;
    isApproved: boolean;
    isPartial: boolean;
    reason: {
        time: string;
        description: string;
    };
    selfies: ISelfie[];
}