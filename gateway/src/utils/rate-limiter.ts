import redis from "../config/redis";

// Implementation of Rate limitter
class RateLimitter {
    /**
     * Checks if a given email is currently blocked due to too many login attempts.
     * @param email - The email address to check for blocking status.
     * @returns A promise that resolves to `true` if the email is blocked, otherwise `false`.
     */
    async isBlock(email: string) {
        let key = `login_attempts:${email}`;
        const attempts = await redis.get(key);
        return attempts && Number(attempts) >= 5;
    }

    /**
     * Handles the response for a given login attempt.
     * @param email - The email address that was used for the login attempt.
     * @param statusCode - The HTTP status code that was returned for the login attempt.
     * @returns A promise that resolves to `true` if the email is blocked, otherwise `false`.
     */
    async responseHandler(email: string, statusCode: number) {
        let key = `login_attempts:${email}`;

        if (statusCode !== 200) {
            await redis.incr(key);
        }

        const isBlock = await this.isBlock(email);

        if (isBlock) {
            return true;
        }

        return false;
    }
}

const rateLimitter = new RateLimitter();
export default rateLimitter;
