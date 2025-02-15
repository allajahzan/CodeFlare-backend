import { IBaseRepository } from "@codeflare/common";
import { IProfileSchema } from "../../entities/IProfileSchema";

/** Interface for Profile Repository */
export interface IProfileRepository extends IBaseRepository<IProfileSchema> {
    getProfileByUserId(_id: string): Promise<IProfileSchema | null>;
    updateProfileByUserId(_id: string, profile: Partial<IProfileSchema>): Promise<void | null>
}
