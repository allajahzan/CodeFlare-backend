import { IBatch, IStudent, IUser } from "@codeflare/common";

/** Dto for CheckInOut */
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
    isApproved: boolean | null;
    reason: {
        time: string;
        description: string;
    };
    report: {
        time: string;
        description: string;
    };
    selfies: boolean[];
}