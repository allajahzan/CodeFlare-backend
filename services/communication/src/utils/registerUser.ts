import { redisClient } from "@codeflare/common";

/**
 * Retrieves the list of registered users from Redis.
 * @returns A promise that resolves to an array of user objects containing the user's userId and socketId.
 * @throws An error if there is a problem accessing or retrieving the data from Redis.
 */
export const getRegisteredUsers = async (): Promise<
    { userId: string; socketId: string }[]
> => {
    try {
        // await redisClient.DEL('users')

        const data = await redisClient.get("users");

        const users: { userId: string; socketId: string }[] = data
            ? JSON.parse(data)
            : [];

        return users;
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Registers a user by storing their userId and socketId in Redis.
 * @param user - An object containing the user's userId and socketId.
 * @throws An error if there is a problem accessing or updating Redis.
 */
export const registerUser = async (user: {
    userId: string;
    socketId: string;
}) => {
    try {
        const data = await redisClient.get("users");

        let users: { userId: string; socketId: string }[] = data
            ? JSON.parse(data)
            : [];

        // Find index if the user already exists
        const existingUserIndex = users.findIndex((u) => u.userId === user.userId);

        if (existingUserIndex !== -1) {
            users[existingUserIndex].socketId = user.socketId;
        } else {
            users.push(user);
        }

        // Save the updated users list back to Redis
        await redisClient.set("users", JSON.stringify(users));

        console.log(JSON.parse((await redisClient.get("users")) as string));
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Checks if a user is registered by their userId in the Redis store.
 * @param userId - The ID of the user to check.
 * @returns A promise that resolves to a boolean indicating whether the user is registered.
 * @throws An error if there is a problem accessing or retrieving the data from Redis.
 */
export const isUserRegistered = async (userId: string) => {
    try {
        const data = await redisClient.get("users");

        let users: { userId: string; socketId: string }[] = data
            ? JSON.parse(data)
            : [];

        // Check if user exists
        return users.some((user) => user.userId === userId);
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Retrieves the socketId of a user by their userId from the Redis store.
 * @param userId - The ID of the user to retrieve the socketId for.
 * @returns A promise that resolves to the socketId of the user if found, otherwise null.
 * @throws An error if there is a problem accessing or retrieving the data from Redis.
 */
export const getSocketId = async (userId: string) => {
    try {
        const data = await redisClient.get("users");

        let users: { userId: string; socketId: string }[] = data
            ? JSON.parse(data)
            : [];

        // Find user
        const user = users.find((user) => user.userId === userId);

        return user ? user.socketId : null;
    } catch (err: unknown) {
        throw err;
    }
};

/**
 * Removes a user from the list of registered users in Redis by their socketId.
 * @param socketId - The socketId of the user to remove.
 * @throws An error if there is a problem accessing or updating Redis.
 */
export const unRegisterUser = async (socketId: string) => {
    try {
        const data = await redisClient.get("users");
        const users = data ? JSON.parse(data) : [];

        const updatedUsersList = users.filter(
            (user: { userId: string; socketId: string }) => user.socketId !== socketId
        );

        await redisClient.set("users", JSON.stringify(updatedUsersList));

        console.log(JSON.parse((await redisClient.get("users")) as string));
    } catch (err: unknown) {
        throw err;
    }
};
