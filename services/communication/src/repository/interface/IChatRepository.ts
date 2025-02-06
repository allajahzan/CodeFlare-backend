import { IBaseRepository } from "@codeflare/common";
import { IChatSchema } from "../../entities/IChatSchema";
import { FilterQuery, ObjectId, QueryOptions, UpdateQuery } from "mongoose";

/** Interface for Chat Repository */
export interface IChatRepository extends IBaseRepository<IChatSchema> {
    findOneAndUpdate(query: FilterQuery<IChatSchema>,data: UpdateQuery<IChatSchema>,option?: QueryOptions): Promise<IChatSchema | null>;
    getChatsById(_id: string): Promise<IChatSchema [] | null>;
}
