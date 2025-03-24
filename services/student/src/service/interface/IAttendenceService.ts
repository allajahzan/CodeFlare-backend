import { ICheckInOutDto } from "../../dto/attendenceService";
import { IAttendenceSchema } from "../../entities/IAttendence";

/** Interface for Attendence Service */
export interface IAttendenceService {
    checkInOut(userId: string, activity: string): Promise<ICheckInOutDto>;
    getAttendence(userId: string, batchIds: string[]) : Promise<IAttendenceSchema[] | []>
    searchAttendece(userId: string, batchIds: string[], date: string) : Promise<IAttendenceSchema[] | []>
}
