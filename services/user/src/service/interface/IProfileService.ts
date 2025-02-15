import { IProfileDto } from "../../dto/profileServiceDto";
import { IProfileSchema } from "../../entities/IProfileSchema";

/** Interface for Profile Service */
export interface IProfileService {
    getProfileByUserId(tokenPayload: string): Promise<IProfileDto | null>;
    updateProfileByUserId(tokenPayload: string, profile: Partial<IProfileSchema>): Promise<void>;
    changeProfilePic(tokenPayload: string, imageUrl: string): Promise<void>;
}
