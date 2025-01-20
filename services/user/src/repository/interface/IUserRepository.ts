import { Document } from "mongoose";
import { IUserSchema } from "../../modal/interface/IUserSchema";
import { IBaseRepository } from "@codeflare/common";
/** Interface for User Repository */
export interface IUserRepository extends IBaseRepository<IUserSchema> {
    findUserByEmail(email: string): Promise<IUserSchema | null>;
}
