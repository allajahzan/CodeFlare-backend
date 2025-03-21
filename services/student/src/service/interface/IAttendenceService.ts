import { ICheckInOutDto } from "../../dto/attendenceService";

/** Interface for Attendence Service */
export interface IAttendenceService {
    checkInOut(userId: string, activity: string): Promise<ICheckInOutDto>;
}
