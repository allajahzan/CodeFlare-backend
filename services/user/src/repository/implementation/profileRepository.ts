import { BaseRepository } from "@codeflare/common";
import { IProfileRepository } from "../interface/IProfileRepository";
import { IProfileSchema } from "../../entities/IProfileSchema";
import { Model, ObjectId, Types } from "mongoose";

/** Implementation of Profile Repository  */
export class ProfileRepository
    extends BaseRepository<IProfileSchema>
    implements IProfileRepository {
    /**
     * Constructs an instance of ProfileRepository.
     * @param model - The mongoose model representing the profile schema, used for database operations.
     */
    constructor(model: Model<IProfileSchema>) {
        super(model);
    }

    /**
     * Retrieves the profile of a user with the given user id.
     * @param _id - The id of the user to retrieve the profile for.
     * @returns A promise that resolves to the profile document if found, otherwise null.
     * @throws An error if there is a problem retrieving the profile.
     */
    async getProfileByUserId(_id: string): Promise<IProfileSchema | null> {
        try {
            // Lookup to get user details from user collection
            const profile = await this.model.aggregate([
                { $match: { userId: new Types.ObjectId(_id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                { $unwind: "$userDetails" },
            ]);

            return profile[0];
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Updates the profile of a user with the given user id.
     * @param _id - The id of the user to update the profile for.
     * @param profile - The profile document to update the user with.
     * @returns A promise that resolves if the profile is updated successfully, otherwise null.
     * @throws An error if there is a problem updating the profile.
     */
    async updateProfileByUserId(
        _id: string,
        profile: Partial<IProfileSchema>
    ): Promise<void | null> {
        try {
            await this.model.updateOne(
                { userId: _id },
                { $set: profile },
                { upsert: true }
            );
        } catch (err: unknown) {
            return null;
        }
    }
}
