/** Implementation of Profile Service */

import { JwtPayloadType, UnauthorizedError } from "@codeflare/common";
import { IProfileDto } from "../../dto/profileServiceDto";
import { IProfileRepository } from "../../repository/interface/IProfileRepository";
import { IProfileService } from "../interface/IProfileService";
import { IProfileSchema } from "../../entities/IProfileSchema";
import { IUserRepository } from "../../repository/interface/IUserRepository";

export class ProfileService implements IProfileService {
    private profileRepository: IProfileRepository;
    private userRepository: IUserRepository;

    /**
     * Constructs an instance of ProfileService.
     * @param profileRepository - The profile repository to use for performing operations on profiles.
     * @param userRepository - The user repository to use for performing operations on users.
     */
    constructor(
        profileRepository: IProfileRepository,
        userRepository: IUserRepository
    ) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the profile of a user with the given user id from the token payload.
     * @param tokenPayload - The JSON web token payload containing the requester id.
     * @returns A promise that resolves to the profile document if found, otherwise null.
     * @throws {UnauthorizedError} If the token payload is invalid or not provided.
     */
    async getProfileByUserid(tokenPayload: string): Promise<IProfileDto | null> {
        try {
            if (!tokenPayload) {
                throw new UnauthorizedError(
                    "You do not have permission to access this resource."
                );
            }

            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Requester id

            return await this.profileRepository.getProfileByUserId(_id);
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the profile of a user with the given user id from the token payload.
     * @param tokenPayload - The JSON web token payload containing the requester id.
     * @param profile - The profile document to update the user with.
     * @returns A promise that resolves if the profile is updated successfully, otherwise rejects with an error.
     * @throws {UnauthorizedError} If the token payload is invalid or not provided.
     */
    async updateProfileByUserId(
        tokenPayload: string,
        profile: IProfileSchema
    ): Promise<void> {
        try {
            if (!tokenPayload) {
                throw new UnauthorizedError(
                    "You do not have permission to access this resource."
                );
            }

            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Requester id

            await this.profileRepository.update({ userId: _id }, { $set: profile });
        } catch (err: unknown) {
            throw err;
        }
    }

    /**
     * Updates the profile picture of a user with the given user id from the token payload.
     * @param tokenPayload - The JSON web token payload containing the requester id.
     * @param imageUrl - The URL of the new profile picture.
     * @returns A promise that resolves if the profile picture is updated successfully, otherwise rejects with an error.
     * @throws {UnauthorizedError} If the token payload is invalid or not provided.
     */
    async changeProfilePic(
        tokenPayload: string,
        imageUrl: string
    ): Promise<void> {
        try {
            if (!tokenPayload) {
                throw new UnauthorizedError(
                    "You do not have permission to access this resource."
                );
            }

            const { _id } = JSON.parse(tokenPayload) as JwtPayloadType; // Requester id

            await this.userRepository.update({ _id }, { profilePic: imageUrl });
        } catch (err: unknown) {
            throw err;
        }
    }
}
