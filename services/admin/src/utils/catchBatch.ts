import { redisClient } from "@codeflare/common";
import { IBatchDto } from "../dto/batchServiceDto";
import { BatchRepository } from "../repository/implementation/batchRepository";
import Batch from "../modal/batch";

/**
 * Caches the given batch to Redis.
 * @param batch - The batch to cache.
 */
export const cacheBatch = async (batch: IBatchDto) => {
    try {
        const data = await redisClient.get("batches");
        const batches = data ? JSON.parse(data) : [];
        await redisClient.set("batches", JSON.stringify([...batches, batch]));

        console.log(batch, "Cached");
    } catch (err: unknown) {
        throw err;
    }
};

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

        console.log(batch, "Cached updated batch");
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
        await redisClient.set("batches", JSON.stringify(batches));
        console.log("Cached all batches");
    } catch (err: unknown) {
        throw err;
    }
};
