import { IBaseRepository } from "@codeflare/common";
import { IUserSchema } from "../../entities/IUserSchema";

/** Interface for User Repository */
export interface IUserRepository extends IBaseRepository<IUserSchema> {
    findUserByEmail(email: string): Promise<IUserSchema | null>;
    blockUser(_id: string): Promise<IUserSchema | null>;
    unblockUser(_id: string): Promise<IUserSchema | null>;
    searchUser(keyword: string, status: string, sort: string, order:number, category: string, batchId: string, roles: string[]): Promise<IUserSchema[] | null>;
}
