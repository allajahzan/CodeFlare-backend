import { redisClient, IBatch } from "@codeflare/common";
import { ObjectId } from "mongoose";

/**
 * Retrieves a batch from the cache.
 * @param batchId - The id of the batch to retrieve.
 * @returns A promise that resolves to a batch object if the batch is found in the cache, or undefined if it is not.
 * @throws An error if there is a problem retrieving the batch from the cache.
 */
export const getCachedBatch = async (batchId: string | ObjectId) => {
    try {
        const data = await redisClient.get("batches");
        if (!data) return null;

        const batches: IBatch[] = JSON.parse(data);

        return batches.find((b) => b._id === batchId?.toString()) || null;
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

        const batches: IBatch[] = JSON.parse(data);

        // Convert ObjectId to string
        const batchIdStrings = batchIds.map((id) => id.toString());

        return batches.filter((b) => batchIdStrings.includes(b._id));
    } catch (err) {
        console.error("Error fetching batches from cache:", err);
        throw err;
    }
};