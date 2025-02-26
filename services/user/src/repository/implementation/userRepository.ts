import { BaseRepository } from "@codeflare/common";
import { IUserSchema } from "../../entities/IUserSchema";
import { Model, Types } from "mongoose";
import { IUserRepository } from "../interface/IUserRepository";
/** Implementation of User Repository */
export class UserRepository
    extends BaseRepository<IUserSchema>
    implements IUserRepository {
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
                { new: true }
            );
        } catch (err: any) {
            return null;
        }
    }

    /**
     * Searches for users based on the given keyword from the request query.
     * @param keyword - The keyword to search for in the user's name, email, batch, or batches.
     * @param status - The status of the user to search for, either "true" or "false".
     * @param roles - The roles of the users to search for.
     * @returns A promise that resolves to an array of users matching the search criteria if successful, otherwise null.
     */
    async searchUser(
        keyword: string,
        isBlocked: string,
        sort: string,
        order: number,
        category: string,
        batchId: string,
        roles: string[]
    ): Promise<IUserSchema[] | null> {
        try {
            return await this.model.aggregate([
                {
                    $match: {
                        ...(batchId && {
                            $or: [
                                { batch: new Types.ObjectId(batchId) },
                                { batches: new Types.ObjectId(batchId) },
                            ],
                        }),
                        role: batchId ? {} : { $in: roles },
                        ...(isBlocked !== undefined && { isblock: isBlocked === "true" }),
                        ...(keyword && {
                            $or: [
                                { name: { $regex: keyword, $options: "i" } },
                                { email: { $regex: keyword, $options: "i" } },
                            ],
                        }),
                        ...(category && { role: category }),
                    },
                },
                {
                    $sort: sort ? { [sort]: order === 1 ? 1 : -1 } : {createdAt: -1}
                },
            ]);
        } catch (err: unknown) {
            console.log(err);

            return null;
        }
    }
}
