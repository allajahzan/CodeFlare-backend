import { NotFoundError, UnauthorizedError } from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repository/implementation/userRepository";
import User from "../modal/user";

/**
 * Checks if the request is authenticated.
 * @param req - The express request object.
 * @param res - The express response object.
 * @param next - The next middleware function in the express stack.
 * @throws {UnauthorizedError} If the request is not authenticated.
 * @throws {NotFoundError} If the user is not found.
 * @throws {UnauthorizedError} If the user is blocked.
 */
export const checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPayload = req.headers["x-user-payload"]; // Payload from request header
        if (!userPayload) throw new UnauthorizedError("Unauthorized Access");

        const payload = JSON.parse(userPayload as string);
        if (!payload) throw new UnauthorizedError("Unauthorized Access");

        const user = await new UserRepository(User).findOne({_id: payload._id});

        if (!user)
            throw new NotFoundError("No such user found.");

        if (user.role !== payload.role)
            throw new UnauthorizedError("Unauthorized Access");

        if (user.isblock)
            throw new UnauthorizedError(
                "Your account has been blocked. Please contact the admin"
            );

        req.headers["x-user-id"] = JSON.stringify({ _id: user._id }); // Set user _id as request header

        next();
    } catch (err) {
        next(err);
    }
};
