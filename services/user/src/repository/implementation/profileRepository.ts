import { BaseRepository } from "@codeflare/common";
import { IProfileRepository } from "../interface/IProfileRepository";
import { IProfileSchema } from "../../entities/IProfileSchema";
import { Model, ObjectId } from "mongoose";

/** Implementation of Profile Repository  */
class ProfileRepository  extends BaseRepository<IProfileSchema> implements IProfileRepository {
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
            return await this.model.findOne({ userId: _id as unknown as ObjectId });
        } catch (err: unknown) {
            return null;
        }
    }
}
