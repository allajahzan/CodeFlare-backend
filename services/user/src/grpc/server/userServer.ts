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

        console.log(user);

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
