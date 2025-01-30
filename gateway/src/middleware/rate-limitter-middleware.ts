import { NextFunction, Request, Response } from "express";
import rateLimitter from "../utils/rate-limiter";

/**
 * Checks if the given email has too many login attempts and blocks the attempt if needed.
 * @param req - The express request object.
 * @param res - The express response object.
 * @param next - The next middleware function in the express stack.
 * @throws {HTTPError} If the email has too many login attempts.
 */
export const rateLimitterMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Only for login
        if (req.method === "POST" && req.path === "/api/user/login") {
            const email = req.body.email;

            console.log(email);
            

            const isblock = await rateLimitter.isBlock(email);

            if (isblock) {
                res.status(429).json({
                    message: "Too many login attempts, please try again 1 minute later",
                });
            }
        }

        next();
    } catch (err: unknown) {
        console.log(err);
        next(err);
    }
};
