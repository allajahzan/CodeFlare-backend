import { redisClient } from "@codeflare/common";
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

        const batches: { _id: string; name: string }[] = JSON.parse(data);

        return batches.find((b) => b._id === batchId?.toString()) || null;
    } catch (err) {
        console.log("Error fetching batch from cache:", err);
        throw err;
    }
};
