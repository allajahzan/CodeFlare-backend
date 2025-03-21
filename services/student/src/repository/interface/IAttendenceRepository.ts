import { IBaseRepository } from "@codeflare/common";
import { IAttendenceSchema } from "../../entities/IAttendence";

/** Interface for Attendence Repositoty */
export interface IAttendenceRepository extends IBaseRepository<IAttendenceSchema>{
    // checkIn(userId: string) : Promise<IAttendenceSchema | null>;
    // checkOut(userId: string) : Promise<IAttendenceSchema | null>;
}