import { IBaseRepository } from "@codeflare/common";
import { IMessageSchema } from "../../entities/IMessageSchema";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

/** Interface for Message Repository */
export interface IMessageRepository extends IBaseRepository<IMessageSchema> {
    findOneAndUpdate(query: FilterQuery<IMessageSchema>,data: UpdateQuery<IMessageSchema>,option?: QueryOptions): Promise<IMessageSchema | null>;
    getMessages(chatId: string, skip: number) : Promise<IMessageSchema[] | null>
}