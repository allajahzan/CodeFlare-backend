import { IBaseRepository } from "@codeflare/common";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { IChatSchema } from "../../entities/IChatSchema";

/** Interface for Chat Repository */
export interface IChatRepository extends IBaseRepository<IChatSchema> {
    findOneAndUpdate(query: FilterQuery<IChatSchema>,data: UpdateQuery<IChatSchema>,option?: QueryOptions): Promise<IChatSchema | null>;
    getChatsByUserId(userId: string): Promise<IChatSchema [] | null>;
}
