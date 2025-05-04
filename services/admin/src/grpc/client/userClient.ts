import { userClient } from "../grpc.connection";

/**
 * Retrieves a user by id from the user service.
 * @param id The id of the user to retrieve.
 * @returns A Promise that resolves to the user if found, otherwise rejects with an error.
 */
export const getUser = (
    _id: string
): Promise<{
    response: {
        status: number;
        message: string;
        user: {
            _id: string;
            name: string;
            email: string;
            role: string;
            profilePic: string;
            batch: string;
        };
    };
}> => {
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
export const getUsers = (
    userIds: string[]
): Promise<{
    response: {
        status: number;
        message: string;
        users: Record<
            string,
            {
                _id: string;
                name: string;
                email: string;
                role: string;
                profilePic: string;
                batch: string;
            }
        >;
    };
}> => {
    return new Promise((resolve, reject) => {
        userClient.getUsers({ userIds }, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};
