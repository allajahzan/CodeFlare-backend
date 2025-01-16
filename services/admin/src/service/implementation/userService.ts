import {
    ConflictError,
    HTTPStatusCodes,
    NotFoundError,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";
import { IGetUserResponse, IGetUsersResponse } from "../../dto/userServiceDto";
import { IUserRepository } from "../../repository/interface/IUserRepository";
import { IUserService } from "../interface/IUserService";
import { IUserSchema } from "../../modal/interface/IUserSchema";
import { sendEmail } from "../../utils/nodeMailer";

/** Implementation of User Service */
export class UserService implements IUserService {
    private userRepository: IUserRepository;

    /**
     * Constructs an instance of UserService.
     * @param userRepository - The user repository to use for performing operations on users.
     */
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieves all users from the database.
     * @returns A promise that resolves to an object containing an array of all users if successful, otherwise rejects with an error.
     */
    async getUsers(): Promise<IGetUsersResponse> {
        try {
            const users = await this.userRepository.find({});
            return { users };
        } catch (err: any) {
            throw err;
        }
    }

    /**
     * Creates a new user in the database with the given user object.
     * @param user - The user object to create a new user from.
     * @returns A promise that resolves to an object containing the newly created user if successful, otherwise rejects with an error.
     */
    async createUser(user: IUserSchema): Promise<IGetUserResponse> {
        try {
            const isUserExist = await this.userRepository.findUserByEmail(user.email);

            if (isUserExist) throw new ConflictError("User already exists");

            const newUser = await this.userRepository.create(user);

            if (!newUser) throw new Error("Failed to add the user");

            sendEmail(user.email, (error: any, info: any) => { // send email with nodemailer
                if (error) throw new Error(`Failed to send email to ${user.email}`);
            });

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
    async updateUser(_id: string, user: IUserSchema): Promise<IGetUserResponse> {
        try {
            const isUserExist = await this.userRepository.findOne({
                _id: { $ne: _id },
                email: user.email,
            });

            if (isUserExist) throw new ConflictError("User already exists");

            const updatedUser = await this.userRepository.update(
                { _id },
                { $set: user },
                { new: true }
            );

            if (!updatedUser) throw new Error("Failed to update the user");

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
    async changeUserStatus(_id: string): Promise<IGetUserResponse> {
        try {
            const user = await this.userRepository.findOne({ _id });

            if (!user) {
                throw new NotFoundError("User not found");
            }

            const updatedUser = user.isblock
                ? await this.userRepository.unblockUser(_id)
                : await this.userRepository.blockUser(_id);

            if (!updatedUser) {
                throw new Error(
                    user.isblock
                        ? "Failed to unblock the user"
                        : "Failed to block the user"
                );
            }

            return { user: updatedUser };
        } catch (error: any) {
            throw error;
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
            if (!query) throw new Error("Search query is required");

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
}
