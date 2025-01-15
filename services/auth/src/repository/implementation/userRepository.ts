import { IUserSchema } from "../../modal/interface/IUserSchema";
import { IUserRepository } from "../interface/IUserRepository";
import { Model } from "mongoose";
import { BaseRepository } from "@codeflare/common";

/** Implementation of User Repository */
export class UserRepository extends BaseRepository<IUserSchema> implements IUserRepository {
    /**
     * Constructs an instance of UserRepository.
     * @param model - The model of type IUserSchema which will be used by the repository.
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
        } catch (err) {
            return null;
        }
    }
}
