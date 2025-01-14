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
export const isAuthenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const x_user = req.headers["x-user"];
        if (!x_user) throw new UnauthorizedError("Unauthorized Access");

        const payload = JSON.parse(x_user as string);
        if (!payload) throw new UnauthorizedError("Unauthorized Access");

        const user = await new UserRepository(User).findOne({
            _id: payload.userId,
        });
        if (!user)
            throw new NotFoundError("No such user found. Unauthorized Access");

        if (user.role !== payload.role)
            throw new UnauthorizedError("Unauthorized Access");

        if (user.isblock)
            throw new UnauthorizedError(
                "Your account has been blocked. Please contact the admin"
            );

        next();
    } catch (err) {
        next(err);
    }
};
