import { IProfileDto } from "../../dto/profileServiceDto";
import { IProfileSchema } from "../../entities/IProfileSchema";
import { IUserSchema } from "../../entities/IUserSchema";

/** Interface for Profile Service */
export interface IProfileService {
    getProfileByUserId(tokenPayload: string): Promise<IProfileDto | null>;
    updateProfileByUserId(tokenPayload: string, profile: IProfileSchema | IUserSchema): Promise<void>;
    changeProfilePic(tokenPayload: string, imageUrl: string): Promise<void>;
    changePassword(tokenPayload: string, currentPassword: string, newPassword: string): Promise<void>;
}
