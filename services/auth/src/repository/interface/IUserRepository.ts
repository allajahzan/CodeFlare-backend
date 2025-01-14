import { Document } from "mongoose";

/** Interface for User Repository */
export interface IUserRepository<T extends Document> {
    findUserByEmail(email: string): Promise<T | null>;
}
