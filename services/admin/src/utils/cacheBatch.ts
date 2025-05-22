import { redisClient } from "@codeflare/common";
import { IBatchDto } from "../dto/batchServiceDto";
import { BatchRepository } from "../repository/implementation/batchRepository";
import Batch from "../model/batch";

/**
 * Caches the given batch to Redis.
 * @param batch - The batch to cache.
 */
export const cacheBatch = async (batch: IBatchDto) => {
    try {
        const data = await redisClient.get("batches");
        const batches = data ? JSON.parse(data) : [];

        await redisClient.set("batches", JSON.stringify([...batches, batch]));

        console.log(batch, "New batch cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Updates the batch cache in Redis with the provided batch.
 * Replaces the existing batch with the same id in the cache with the updated batch.
 * @param batch - The updated batch to cache.
 * @throws An error if there is a problem retrieving or setting the data in Redis.
 */
export const cacheUpdatedBatch = async (batch: IBatchDto) => {
    try {
        const data = await redisClient.get("batches");
        const batches = data ? JSON.parse(data) : [];

        const updatedBatches = batches.map((b: IBatchDto) => {
            if (b._id === batch._id) {
                return batch;
            } else {
                return b;
            }
        });

        await redisClient.set("batches", JSON.stringify(updatedBatches));

        console.log(batch, "Updated batch cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Caches all batches to Redis.
 * Retrieves all batches from the repository and stores them in Redis with the key "batches".
 * Logs a message upon successful caching.
 * @throws An error if there is a problem retrieving batches or setting them in Redis.
 */
export const cacheAllBatch = async () => {
    try {
        const batches = await new BatchRepository(Batch).find({});  

        const tranformedBatches = batches.map((b) => ({ _id: b._id, name: b.name }));  

        await redisClient.set("batches", JSON.stringify(tranformedBatches));
        console.log("All batches cached");
    } catch (err: unknown) {
        throw err;
    }
};
