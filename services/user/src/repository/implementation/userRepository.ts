import { BaseRepository, IRole, IStudentCategory } from "@codeflare/common";
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
                { $set: { isBlock: true } },
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
                { $set: { isBlock: false } },
                { new: true }
            );
        } catch (err: any) {
            return null;
        }
    }

    /**
     * Searches for users based on the given keyword, sort, order, status, roleWise, category, batchId, and roles.
     * @param keyword - The keyword to search for in the user's name or email.
     * @param isBlock - The status of the users to search for, either "true" or "false".
     * @param sort - The field to sort the result by.
     * @param order - The order of the sorting, either 1 for ascending or -1 for descending.
     * @param roleWise - The role of the users to search for.
     * @param category - The category of the users to search for.
     * @param batchId - The id of the batch to search for users in.
     * @param roles - The list of roles to search for users in.
     * @returns A promise that resolves to an array of user objects if the users are found, otherwise null.
     */
    async searchUser(
        keyword: string,
        isBlock: string,
        sort: string,
        order: number,
        roleWise: IRole,
        category: IStudentCategory,
        batchId: string,
        weekId: string,
        domainId: string,
        roles: IRole[]
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
                        ...(weekId && { week: new Types.ObjectId(weekId) }),
                        ...(domainId && { domain: new Types.ObjectId(domainId) }),
                        ...(roles && { role: { $in: roles } }),
                        ...(roleWise && { role: roleWise }),
                        ...(isBlock && { isBlock: isBlock === "true" }),
                        ...(keyword && {
                            $or: [
                                { name: { $regex: keyword, $options: "i" } },
                                { email: { $regex: keyword, $options: "i" } },
                            ],
                        }),
                        ...(category && { category }),
                    },
                },
                {
                    $sort: sort ? { [sort]: order === 1 ? 1 : -1 } : { createdAt: -1 },
                },
            ]);
        } catch (err: unknown) {
            return null;
        }
    }

    /**
     * Retrieves the count of users matching the given criteria.
     * @param role - The role of the users to count.
     * @param batchId - The ID of the batch to which the users should belong.
     * @param weekId - The ID of the week to which the users should belong.
     * @param domainId - The ID of the domain to which the users should belong.
     * @returns A promise that resolves to the count of users matching the criteria if successful, otherwise resolves to null.
     */
    async getUsersCount(
        role: IRole,
        batchId?: string[],
        weekId?: string,
        domainId?: string
    ): Promise<number | null> {
        try {
            // console.log(role, batchId, weekId, domainId)
            const result = await this.model.aggregate([
                {
                    $match: {
                        role,
                    },
                },
                {
                    $match: {
                        ...(batchId &&
                            batchId.length > 0 && {
                            ...(role === "student"
                                ? {
                                    batch: {
                                        $in: batchId.map((batch) => new Types.ObjectId(batch)),
                                    },
                                }
                                : role === "coordinator"
                                    ? {
                                        batches: {
                                            $in: batchId.map((batch) => new Types.ObjectId(batch)),
                                        },
                                    }
                                    : {}),
                        }),
                        ...(weekId && { week: new Types.ObjectId(weekId) }),
                        ...(domainId && { domain: new Types.ObjectId(domainId) }),
                    },
                },
                {
                    $count: "total",
                },
            ]);

            const count = result[0]?.total || 0;

            return count;
        } catch (err: unknown) {
            return null;
        }
    }
}
