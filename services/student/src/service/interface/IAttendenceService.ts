import { IAttendenceDto, ICheckInOutDto } from "../../dto/attendenceDto";

/** Interface for Attendence Service */
export interface IAttendenceService {
    checkInOut(userId: string, activity: string, reason: string, attendanceId: string): Promise<ICheckInOutDto>;
    getAttendence(userId: string, month: string, year: string): Promise<IAttendenceDto | IAttendenceDto[]>
    searchAttendence(userId: string, batchIds: string[], date: string, sort: string, order: number, filter: string): Promise<IAttendenceDto[] | []>
    approvalCheckIn(attendanceId: string) : Promise<void>;
    uploadSnapshot(userId: string, imageUrl: string, location: string): Promise<void>;
    updateStatus(attendenceId: string, status: "Pending" | "Present" | "Absent" | "Late", reason: string): Promise<void>;
    getMonthlyAttendence(type: string, userId: string, batchIds: string[], month: string, year: number, filter: string, skip: number, limit: number): Promise<IAttendenceDto[]>
}