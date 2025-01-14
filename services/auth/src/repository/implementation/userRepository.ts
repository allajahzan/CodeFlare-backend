import { IUserSchema } from "../../modal/interfaces/IuserSchema";
import { IUserRepository } from "../interface/IUserRepository";
import { BaseRepository } from "./baseRepository";
import { FilterQuery, Model, Document } from "mongoose";

/** User Repository */
export class UserRepositor extends BaseRepository<IUserSchema> implements IUserRepository<IUserSchema> {
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
