import { status } from "@grpc/grpc-js";
import User from "../../model/userSchema";
import { UserRepository } from "../../repository/implementation/userRepository";
import { IUserDto } from "../../dto/userServiceDto";
import { IUserSchema } from "../../entities/IUserSchema";
import { IStudent, IUser } from "@codeflare/common";

const userRepository = new UserRepository(User);

/**
 * Handles notification request.
 * @param {Object} call - gRPC call object with request data.
 * @param {function} callback - Callback function with response data.
 * @returns {Object} response - Response object with status and message.
 */
export const getUser = async (call: any, callback: any) => {
    try {
        const { _id } = call.request;

        const user = await userRepository.findOne({ _id }); // Find user by _id

        if (!user) {
            return callback(null, {
                response: {
                    status: 404,
                    message: "No user found !",
                    user: null,
                },
            });
        }

        // Map user data to response type
        const formattedUser: IStudent | IUser = {
            _id: user._id as unknown as string,
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo,
            profilePic: user.profilePic,
            role: user.role,
            ...(user.week && { week: user.week }),
            ...(user.domain && { domain: user.domain }),
            ...(user.batch && { batch: user.batch as unknown as string }),
            ...(user.batches && { batches: user.batches as unknown as string[] }),
            ...(user.category && { category: user.category }),
            ...(user.lastActive && { lastActive: user.lastActive }),
            createdAt: user.createdAt,
            isBlock: user.isBlock,
        };

        callback(null, {
            response: {
                status: 200,
                message: "Successfully fetched user info",
                user: formattedUser,
            },
        });
    } catch (err) {
        console.log(err);
        callback(null, {
            response: {
                status: 500,
                message: "Internal server error",
                user: null,
            },
        });
    }
};

/**
 * Retrieves multiple users by their ids from the user service.
 * @param {Object} call - gRPC call object with request data.
 * @param {function} callback - Callback function with response data.
 * @returns {Object} response - Response object with status and message.
 */
export const getUsers = async (call: any, callback: any) => {
    try {
        const { userIds } = call.request;

        const users = await userRepository.find({
            _id: { $in: userIds },
        }); // Find users with ids

        if (!users.length) {
            return callback(null, {
                response: {
                    status: 404,
                    message: "No users found!",
                    users: null,
                },
            });
        }

        // Map user data to response type
        const usersMap: Record<string, IStudent | IUser> = {};

        users.forEach((user) => {
            usersMap[user._id as string] = {
                _id: user._id as unknown as string,
                name: user.name,
                email: user.email,
                phoneNo: user.phoneNo,
                profilePic: user.profilePic,
                role: user.role,
                ...(user.week && { week: user.week }),
                ...(user.domain && { domain: user.domain }),
                ...(user.batch && { batch: user.batch as unknown as string }),
                ...(user.batches && { batches: user.batches as unknown as string[] }),
                ...(user.category && { category: user.category }),
                ...(user.lastActive && { lastActive: user.lastActive }),
                createdAt: user.createdAt,
                isBlock: user.isBlock,
            };
        });

        callback(null, {
            response: {
                status: 200,
                message: "Successfully fetched users info",
                users: usersMap,
            },
        });
    } catch (err) {
        console.log(err);
        callback(null, {
            response: {
                status: 500,
                message: "Internal server error",
                users: null,
            },
        });
    }
};

/**
 * Updates a user by their id using the user service.
 * @param {Object} call - gRPC call object with request data.
 * @param {function} callback - Callback function with response data.
 * @returns {Object} response - Response object with status and message.
 */
export const updateUser = async (call: any, callback: any) => {
    try {
        const { _id, data } = call.request;

        const user = await userRepository.findOne({ _id });

        if (!user) {
            // Correctly format the response
            return callback(null, {
                response: {
                    status: 404,
                    message: "User not found",
                    data: null,
                },
            });
        }

        const updatedUser = await userRepository.update(
            { _id },
            { $set: JSON.parse(data).data }
        );

        callback(null, {
            response: {
                status: 200,
                message: "Successfully updated user info",
                data: updatedUser,
            },
        });
    } catch (err) {
        console.log(err);
        callback(null, {
            response: {
                status: 500,
                message: "Internal server error",
                data: null,
            },
        });
    }
};

/**
 * Retrieves all students' ids.
 * @param {Object} call - gRPC call object with request data.
 * @param {function} callback - Callback function with response data.
 * @returns {Object} response - Response object with status and message.
 */
export const getStudentsIds = async (call: any, callback: any) => {
    try {
        const data = await userRepository.find({ role: "student" });

        // Map data to return type
        const students: {
            _id: string;
            name: string;
            email: string;
            role: string;
            profilePic: string;
            batch: string;
        }[] = data.map((student) => ({
            _id: student._id as unknown as string,
            name: student.name,
            email: student.email,
            role: student.role,
            profilePic: student.profilePic || "",
            batch: student.batch as unknown as string,
        }));

        callback(null, {
            response: {
                status: 200,
                message: "Successfully fetched users info",
                students,
            },
        });
    } catch (err) {
        console.log(err);
        callback(null, {
            status: 500,
            message: "Internal Server Error",
            data: null,
        });
    }
};
