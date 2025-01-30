import { createClient } from "redis";

// Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL,
});

// Redis events
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("ready", () => console.log("Redis is ready to use"));
redisClient.on("reconnecting", () => console.log("Redis reconnecting..."));
redisClient.on("end", () => console.log("Redis disconnected"));
redisClient.on("error", (err) => console.error("edis Error:", err));

// Connect to redis
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err: unknown) {
        console.log(err);
    }
};

export { redisClient, connectRedis };
