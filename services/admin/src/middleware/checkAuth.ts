import { NotFoundError, UnauthorizedError } from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import Admin from "../modal/batch";

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
        const userPayload = req.headers["x-user-payload"]; // payload from request header
        if (!userPayload) throw new UnauthorizedError("Authentication failed. Please login again!");

        const payload = JSON.parse(userPayload as string);
        if (!payload) throw new UnauthorizedError("Invalid authentication data. Please login again!");

        // const admin = await new AdminRepositoty(Admin).findOne({ _id: payload._id }); // Find admin by _id
        // if (!admin) throw new NotFoundError("Account not found. Please contact support!");

        // if (admin.role !== payload.role)
        //     throw new UnauthorizedError("You do not have permission to access this resource!");

        // req.headers["x-user-id"] = JSON.stringify({ _id: admin._id }); // Set _id as request header

        next();
    } catch (err) {
        next(err);
    }
};
