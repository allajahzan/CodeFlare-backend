import { IBaseRepository } from "@codeflare/common";
import { IAttendenceSchema } from "../../entities/IAttendence";
import { FilterQuery, QueryOptions, UpdateQuery, UpdateWriteOpResult } from "mongoose";

/** Interface for Attendence Repositoty */
export interface IAttendenceRepository extends IBaseRepository<IAttendenceSchema> {
    insertMany(data: IAttendenceSchema[]): Promise<IAttendenceSchema[] | null>;
    updateMany(filter: FilterQuery<IAttendenceSchema>, update: UpdateQuery<IAttendenceSchema>, options?: QueryOptions): Promise<UpdateWriteOpResult | null>;
    searchAttendence(userId: string, batchIds: string[], date: string, sort: string, order: number, filter: string): Promise<IAttendenceSchema[] | null>
}
