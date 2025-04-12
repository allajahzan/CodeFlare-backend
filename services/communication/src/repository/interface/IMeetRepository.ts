import { IBaseRepository } from "@codeflare/common";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { IMeetSchema } from "../../entities/IMeetSchema";

/** Interface for Meet Repository */
export interface IMeetRepository extends IBaseRepository<IMeetSchema> {
    findOneAndUpdate(query: FilterQuery<IMeetSchema>,data: UpdateQuery<IMeetSchema>,option?: QueryOptions): Promise<IMeetSchema | null>;
}
