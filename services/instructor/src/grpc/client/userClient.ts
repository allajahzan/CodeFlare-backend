import { IUser } from "../../dto/reviewService";
import { userClient } from "../grpc.connection";

/**
 * Retrieves a user by id from the user service.
 * @param id The id of the user to retrieve.
 * @returns A Promise that resolves to the user if found, otherwise rejects with an error.
 */
export const getUser = (_id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        userClient.getUser({ _id }, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};

/**
 * Retrieves multiple users by their ids from the user service.
 * @param userIds The ids of the users to retrieve.
 * @returns A Promise that resolves to the users if found, otherwise rejects with an error.
 */
export const getUsers = (userIds: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        userClient.getUsers({ userIds }, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                const usersMap = response?.users || {};
                resolve(usersMap);
            }
        });
    });
};

/**
 * Updates a user by their id using the user service.
 * @param userId The id of the user to update.
 * @returns A Promise that resolves to the updated user data if successful, otherwise rejects with an error.
 */
export const updateUser = (
    userId: string,
    data: any
): Promise<{ response: { status: number; message: string; data: any } }> => {
    return new Promise((resolve, reject) => {
        userClient.updateUser(
            { _id: userId, data: JSON.stringify({ data }) },
            (error: any, response: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            }
        );
    });
};
