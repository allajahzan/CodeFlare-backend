import { IRole, IStudent, IUser } from "@codeflare/common";
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
        user: IUser | IStudent;
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
    userIds: string[],
    role: IRole | ""
): Promise<{
    response: {
        status: number;
        message: string;
        users: Record<string, IUser | IStudent>;
    };
}> => {
    return new Promise((resolve, reject) => {
        userClient.getUsers({ userIds, role }, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};

/**
 * Retrieves all students' ids.
 * @returns A Promise that resolves to an object containing the list of students, otherwise rejects with an error.
 */
export const getStudentsIds = (): Promise<{
    response: {
        status: number;
        message: string;
        students: {
            _id: string;
            name: string;
            email: string;
            role: string;
            profilePic: string;
            batch: string;
        }[];
    };
}> => {
    return new Promise((resolve, reject) => {
        userClient.getStudentsIds({}, (error: any, response: any) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};
