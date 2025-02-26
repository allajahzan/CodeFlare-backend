import { status } from "@grpc/grpc-js";
import User from "../../model/userSchema";
import { UserRepository } from "../../repository/implementation/userRepository";

/**
 * Handles notification request.
 * @param {Object} call - gRPC call object with request data.
 * @param {function} callback - Callback function with response data.
 * @returns {Object} response - Response object with status and message.
 */
export const getUser = async (call: any, callback: any) => {
    try {
        const { _id } = call.request;

        const user = await new UserRepository(User).findOne({ _id }); // Find user by _id

        if (!user) {
            return callback({ code: status.NOT_FOUND, msg: "User not found" }, null); // Error response
        }

        // Map user data to response type
        const formattedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic || "",
        };

        callback(null, formattedUser); // Success respnose
    } catch (err) {
        console.log(err);
        callback({ status: status.INTERNAL, msg: "Internal Server Error" }, null);
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

        const users = await new UserRepository(User).find({
            _id: { $in: userIds },
        }); // Find users with ids

        if (!users.length) {
            return callback({ code: status.NOT_FOUND, msg: "User not found" }, null); // Error response
        }

        // Map user data to response type
        const usersMap: Record<string, any> = {};
        users.forEach((user) => {
            usersMap[user._id as string] = {
                userId: user._id as string,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic,
            };
        });

        callback(null, { users: usersMap }); // Success respnose
    } catch (err) {
        console.log(err);
        callback({ status: status.INTERNAL, msg: "Internal Server Error" }, null);
    }
};
