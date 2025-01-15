import { IBaseRepository } from "@codeflare/common";
import { IUserSchema } from "../../modal/interface/IUserSchema";
import { FilterQuery } from "mongoose";

/** Interface for User Repository */
export interface IUserRepository extends IBaseRepository<IUserSchema> {
    findUserByEmail(email: string): Promise<IUserSchema | null>;
    blockUser(_id: string): Promise<IUserSchema | null>;
    unblockUser(_id: string): Promise<IUserSchema | null>;
}
