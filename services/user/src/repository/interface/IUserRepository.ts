import { IBaseRepository, IRole, IStudentCategory } from "@codeflare/common";
import { IUserSchema } from "../../entities/IUserSchema";

/** Interface for User Repository */
export interface IUserRepository extends IBaseRepository<IUserSchema> {
    findUserByEmail(email: string): Promise<IUserSchema | null>;
    blockUser(_id: string): Promise<IUserSchema | null>;
    unblockUser(_id: string): Promise<IUserSchema | null>;
    searchUser(keyword: string, isBlock: string, sort: string, order:number, roleWise: IRole, category: IStudentCategory, batchId: string, weekId: string, domainId: string, roles: IRole[]): Promise<IUserSchema[] | null>;
}
