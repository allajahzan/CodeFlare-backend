import { ICheckInDto, ICheckOutDto } from "../../dto/attendenceService";

/** Interface for Attendence Service */
export interface IAttendenceService {
    checkIn(userId: string): Promise<ICheckInDto>;
    checkOut(userId: string): Promise<ICheckOutDto>;
}
