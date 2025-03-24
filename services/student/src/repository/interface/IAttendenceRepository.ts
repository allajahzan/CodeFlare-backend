import { IBaseRepository } from "@codeflare/common";
import { IAttendenceSchema } from "../../entities/IAttendence";

/** Interface for Attendence Repositoty */
export interface IAttendenceRepository extends IBaseRepository<IAttendenceSchema> {
    insertMany(data: IAttendenceSchema[]): Promise<IAttendenceSchema[] | null>;
    searchAttendence(userId: string, batchIds: string[], date: string): Promise<IAttendenceSchema[] | null>
}
