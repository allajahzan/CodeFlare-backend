import { ICheckInOutDto } from "../../dto/attendenceService";
import { IAttendenceSchema } from "../../entities/IAttendence";

/** Interface for Attendence Service */
export interface IAttendenceService {
    checkInOut(userId: string, activity: string, time: string,reason: string): Promise<ICheckInOutDto>;
    getAttendence(userId: string) : Promise<IAttendenceSchema>
    searchAttendence(userId: string, batchIds: string[], date: string) : Promise<IAttendenceSchema[] | []>
}
