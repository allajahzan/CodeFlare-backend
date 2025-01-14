import { Document } from "mongoose";
import { IUserSchema } from "../../modal/interfaces/IUserSchema";
import { IBaseRepository } from "./IBaseRepository";

/** Interface for User Repository */
export interface IUserRepository extends IBaseRepository<IUserSchema> {
    findUserByEmail(email: string): Promise<IUserSchema | null>;
}
