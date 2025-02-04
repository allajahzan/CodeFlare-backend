import { userClient } from "../grpc.connection";

/**
 * Retrieves a user by id from the user service.
 * @param id The id of the user to retrieve.
 * @returns A Promise that resolves to the user if found, otherwise rejects with an error.
 */
export const getUser = (id: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        userClient.getUser({ id }, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};
