import { redisClient } from "@codeflare/common";
import { IWeekDto } from "../dto/weekServiceDto";
import { WeekRepository } from "../repository/implementation/weekRepository";
import Week from "../modal/week";

/**
 * Caches a week in Redis cache.
 * Retrieves the list of weeks from Redis, adds the given week and saves the list back to Redis.
 * Logs a message upon successful caching.
 * @param {IWeekDto} week - The week to cache in Redis.
 * @throws An error if there is a problem retrieving the weeks or caching the new week.
 */
export const cacheWeek = async (week: IWeekDto) => {
    try {
        const data = await redisClient.get("weeks");
        const weeks = data ? JSON.parse(data) : [];

        await redisClient.set("weeks", JSON.stringify([...weeks, week]));

        console.log(week, "New week cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Updates a week in Redis cache.
 * Retrieves the list of weeks from Redis, updates the specified week and saves the list back to Redis.
 * Logs a message upon successful caching.
 * @param {IWeekDto} week - The week to update in Redis cache.
 * @throws An error if there is a problem retrieving the weeks or caching the updated week.
 */
export const cacheUpdatedWeek = async (week: IWeekDto) => {
    try {
        const data = await redisClient.get("weeks");
        const weeks = data ? JSON.parse(data) : [];

        const updatedWeeks = weeks.map((w: IWeekDto) => {
            if (w._id === week._id) {
                return week;
            } else {
                return w;
            }
        });

        await redisClient.set("weeks", JSON.stringify(updatedWeeks));

        console.log(week, "Updated week cached");
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Caches all weeks from the database into Redis.
 * Retrieves all weeks from the database, transforms them into a simplified DTO format,
 * and stores them as a JSON string in the Redis cache with the key "weeks".
 * Logs a message upon successful caching.
 * @throws An error if there is a problem retrieving the weeks or caching them.
 */
export const cacheAllWeeks = async () => {
    try {
        const weeks = await new WeekRepository(Week).find({});

        const tranformedWeeks = weeks.map((w) => ({
            _id: w._id,
            name: w.name,
        }));

        await redisClient.set("weeks", JSON.stringify(tranformedWeeks));
        console.log("All weeks cached");
    } catch (err: unknown) {
        throw err;
    }
};
