import { Redis } from "@codeflare/common";

export class RateLimiter {
    private readonly id: string;
    private redis;

    /**
     * Creates a new instance of RateLimiter, which limits the number of attempts
     * to login with the given id.
     * @param id The id to limit login attempts for.
     */
    constructor(id: string) {
        this.id = id;
        this.redis = new Redis(`rate-limit:${id}`);
    }

    /**
     * Sets the value of the rate limiter to the given value, with the given
     * @param value The value to set the rate limiter to.
     * @param ttl The TTL of the rate limiter in seconds.
     */
    async setValue(value: string, ttl: number) {
        await this.redis.setValue(value, ttl);
    }

    /**
     * Retrieves the current value of the rate limiter.
     * @returns The current value of the rate limiter.
     */
    async getValue() {
        return await this.redis.getValue();
    }

    /**
     * Deletes the current value associated with the rate limiter in Redis.
     * This operation removes the key-value pair for the specified id.
     */
    async deleteValue() {
        await this.redis.deleteValue();
    }
}
