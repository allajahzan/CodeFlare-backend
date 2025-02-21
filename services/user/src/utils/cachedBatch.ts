import { redisClient } from "@codeflare/common";
import { IUserSchema } from "../entities/IUserSchema";
import { ObjectId } from "mongoose";

/**
 * Retrieves a batch from the cache.
 * @param batchId - The id of the batch to retrieve.
 * @returns A promise that resolves to a batch object if the batch is found in the cache, or undefined if it is not.
 * @throws An error if there is a problem retrieving the batch from the cache.
 */
export const getCachedBatch = async (batchId: string) => {
    try {
        const data = await redisClient.get("batches");
        if (!data) return null;

        const batches: { _id: string; name: string }[] = JSON.parse(data);
        return batches.find((b) => b._id === batchId) || null;
    } catch (err) {
        console.error("Error fetching batch from cache:", err);
        throw err;
    }
};

/**
 * Retrieves an array of batches from the cache.
 * @param batchIds - The ObjectId of the batches to retrieve.
 * @returns A promise that resolves to an array of batch objects if the batches are found in the cache, or an empty array if they are not.
 * @throws An error if there is a problem retrieving the batches from the cache.
 */
export const getCachedBatches = async (batchIds: ObjectId[]) => {
    try {
        const data = await redisClient.get("batches");

        if (!data) return [];

        const batches: { _id: string; name: string }[] = JSON.parse(data);

        //  Convert ObjectId to string
        const batchIdStrings = batchIds.map((id) => id.toString());

        return batches.filter((b) => batchIdStrings.includes(b._id));
    } catch (err) {
        console.error("Error fetching batches from cache:", err);
        throw err;
    }
};

/**
 * Retrieves an array of users with their batch details from the cache.
 * @param users - The list of users to retrieve batch details for.
 * @returns A promise that resolves to an array of user objects with their batch details.
 * @throws An error if there is a problem retrieving the batch details from the cache.
 */
export const getUsersWithBatchDetails = async (users: IUserSchema[]) => {
    try {

        // plane users
        const planeUsers = users.map(user => 
            user.toObject ? user.toObject() : user
        );
        
        // Unique batch ids
        const uniqueBatchIds = [
            ...new Set(
                planeUsers.flatMap((user) => [
                    ...(user.batches?.length ? user.batches : []),
                    ...(user.batch ? [user.batch] : []),
                ])
            ),
        ];

        // Fetch batch details from cache
        const cachedBatches = await getCachedBatches(uniqueBatchIds);

        // Map planeUsers with batch details
        return planeUsers.map((user : IUserSchema) => ({
            ...user,
            ...(user.batch
                ? {
                    batch:
                        cachedBatches.find((b) => b._id === user.batch.toString()) ||
                        null,
                }
                : {}),
            ...(user.batches?.length
                ? {
                    batches: cachedBatches.filter((cachedBatch) =>
                        user.batches.some(
                            (batchId) => batchId.toString() === cachedBatch._id
                        )
                    ),
                }
                : {}),
        }));
    } catch (err) {
        throw err;
    }
};
