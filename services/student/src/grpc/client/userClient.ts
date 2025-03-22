import { userClient } from "../grpc.connection";

/**
 * Retrieves the students' ids given the batchIds from the user service.
 * @param {string[]} batchIds - The batch ids to retrieve the students' ids for.
 * @returns {Promise<{ response: { status: number; message: string; data: any } }>} - Promise that resolves to the response from the user service.
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
