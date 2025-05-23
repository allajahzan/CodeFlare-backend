import { redisClient, IWeek } from "@codeflare/common";
import { ObjectId } from "mongoose";

/**
 * Retrieves a week from the cache.
 * @param weekId - The id of the week to retrieve.
 * @returns A promise that resolves to a week object if the week is found in the cache, or null if it is not.
 * @throws An error if there is a problem retrieving the week from the cache.
 */
export const getCachedWeek = async (weekId: string | ObjectId) => {
    try {
        const data = await redisClient.get("weeks");
        if (!data) return null;

        const weeks: IWeek[] = JSON.parse(data);

        return weeks.find((w) => w._id === weekId?.toString()) || null;
    } catch (err) {
        console.log("Error fetching week from cache:", err);
        throw err;
    }
};

/**
 * Retrieves an array of weeks from the cache.
 * @param weekIds - The ObjectIds of the weeks to retrieve.
 * @returns A promise that resolves to an array of week objects if the weeks are found in the cache, or an empty array if they are not.
 * @throws An error if there is a problem retrieving the weeks from the cache.
 */
export const getCachedWeeks = async (weekIds: ObjectId[]) => {
    try {
        const data = await redisClient.get("weeks");

        if (!data) return [];

        const weeks: IWeek[] = JSON.parse(data);

        // Convert ObjectId to string
        const weekIdStrings = weekIds.map((id) => id.toString());

        return weeks.filter((b) => weekIdStrings.includes(b._id));
    } catch (err) {
        console.log("Error fetching weeks from cache:", err);
        throw err;
    }
};

/**
 * Retrieves all weeks from the cache.
 * @returns A promise that resolves to an array of all weeks if they are found in the cache, or an empty array if they are not.
 * @throws An error if there is a problem retrieving the weeks from the cache.
 */
export const getAllWeeks = async () => {
    try {
        const data = await redisClient.get("weeks");

        if (!data) return [];

        const weeks: IWeek[] = JSON.parse(data);

        return weeks;
    } catch (err) {
        console.log("Error fetching weeks from cache:", err);
        throw err;
    }
};
