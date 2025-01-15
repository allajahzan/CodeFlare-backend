import { NotFoundError } from "@codeflare/common";
import { IFindUserResponse, IGetUsersResponse } from "../../dto/userServiceDto";
import { IUserRepository } from "../../repository/interface/IUserRepository";
import { IUserService } from "../interface/IUserService";
import { IUserSchema } from "../../modal/interface/IUserSchema";

/** Implementation of User Service */
class UserService implements IUserService {
    private userRepository: IUserRepository;

    /**
     * Constructs an instance of UserService.
     * @param userRepository - The user repository to use for performing operations on users.
     */
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Creates a new user in the database with the given user object.
     * @param user - The user object to create a new user from.
     * @returns A promise that resolves to an object containing the newly created user if successful, otherwise rejects with an error.
     */
    async createUser(user: IUserSchema): Promise<IFindUserResponse> {
        try {
            const newUser = await this.userRepository.create(user);
            if (!newUser) throw new Error("User not created");

            return { user: newUser };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Updates an existing user in the database with the given user object.
     * @param _id - The id of the user to update.
     * @param user - The user object to update the user with.
     * @returns A promise that resolves to an object containing the updated user if successful, otherwise rejects with an error.
     */
    async updateUser(_id: string, user: IUserSchema): Promise<IFindUserResponse> {
        try {
            const updatedUser = await this.userRepository.update(
                { _id },
                { $set: user }
            );
            if (!updatedUser) throw new Error("User not updated");

            return { user: updatedUser };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Blocks a user with the given _id.
     * @param _id - The id of the user to block.
     * @returns A promise that resolves to an object containing the blocked user if successful, otherwise rejects with an error.
     */
    async blockUser(_id: string): Promise<IFindUserResponse> {
        try {
            const blockedUser = await this.userRepository.blockUser(_id);
            if (!blockedUser) throw new Error("User not blocked");

            return { user: blockedUser };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Unblocks a user with the given _id.
     * @param _id - The id of the user to unblock.
     * @returns A promise that resolves to an object containing the unblocked user if successful, otherwise rejects with an error.
     */
    async unblockUser(_id: string): Promise<IFindUserResponse> {
        try {
            const unblockedUser = await this.userRepository.unblockUser(_id);
            if (!unblockedUser) throw new Error("User not unblocked");
            return { user: unblockedUser };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Searches for users in the database with the given query.
     * The search is case insensitive and searches through the name, email and batches fields.
     * @param query - The query to search for.
     * @returns A promise that resolves to an object containing an array of users that match the search query.
     */
    async searchUsers(query: string): Promise<IGetUsersResponse> {
        try {
            const users = await this.userRepository.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } },
                    { batches: { $regex: query, $options: "i" } },
                ],
            });

            return { users };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Finds a single user in the database that matches the given email.
     * @param email - The email to filter the documents.
     * @returns A promise that resolves to the user that matches the email if found, otherwise rejects with a NotFoundError.
     */
    async findUserByEmail(email: string): Promise<IFindUserResponse> {
        try {
            const user = await this.userRepository.findUserByEmail(email);
            if (!user) throw new NotFoundError("User not found");

            return { user };
        } catch (err: any) {
            throw err;
        }
    }
}
