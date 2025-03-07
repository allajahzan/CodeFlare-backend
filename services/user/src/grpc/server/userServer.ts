import { status } from "@grpc/grpc-js";
import User from "../../model/userSchema";
import { UserRepository } from "../../repository/implementation/userRepository";

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

        const users = await userRepository.find({
            _id: { $in: userIds },
        }); // Find users with ids

        if (!users.length) {
            return callback({ code: status.NOT_FOUND, msg: "User not found" }, null); // Error response
        }

        // Map user data to response type
        const usersMap: Record<string, any> = {};
        users.forEach((user) => {
            usersMap[user._id as string] = {
                _id: user._id,
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
            console.log("No user");

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
            response: { status: 200, message: "User updated", data: updatedUser },
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
