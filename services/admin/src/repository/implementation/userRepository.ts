import { BaseRepository } from "@codeflare/common";
import { IUserSchema } from "../../modal/interface/IUserSchema";
import { IUserRepository } from "../interface/IUserRepository";
import { Model } from "mongoose";

/** Implementation of User Repository */
export class UserRepository extends BaseRepository<IUserSchema> implements IUserRepository {
    /**
     * Constructs an instance of UserRepository.
     * @param model - The mongoose model representing the user schema, used for database operations.
     */
    constructor(model: Model<IUserSchema>) {
        super(model);
    }

    /**
     * Finds a single user in the database that matches the given email.
     * @param email - The email to filter the documents.
     * @returns A promise that resolves to the user that matches the email if found, otherwise null.
     */
    async findUserByEmail(email: string): Promise<IUserSchema | null> {
        try {
            return await this.model.findOne({ email });
        } catch (err: any) {
            return null;
        }
    }

    /**
     * Blocks a user with the given _id.
     * @param _id - The id of the user to block.
     * @returns A promise that resolves to the updated user if the blocking is successful, otherwise null.
     */
    async blockUser(_id: string): Promise<IUserSchema | null> {
        try {
            return await this.model.findOneAndUpdate(
                { _id },
                { $set: { isblock: true } },
                { new: true }
            );
        } catch (err: any) {
            return null;
        }
    }

    /**
     * Unblocks a user with the given _id.
     * @param _id - The id of the user to unblock.
     * @returns A promise that resolves to the updated user if the unblocking is successful, otherwise null.
     */
    async unblockUser(_id: string): Promise<IUserSchema | null> {
        try {
            return await this.model.findOneAndUpdate(
                { _id },
                { $set: { isblock: false } },
                { new: true}
            );
        } catch (err: any) {
            return null;
        }
    }
}
