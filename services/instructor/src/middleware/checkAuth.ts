import {
    JwtPayloadType,
    NotFoundError,
    UnauthorizedError,
} from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import { getUser } from "../grpc/client/userClient";

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
        if (!userPayload)
            throw new UnauthorizedError("Authentication failed. Please login again!");

        const payload = JSON.parse(userPayload as string) as JwtPayloadType;
        if (!payload)
            throw new UnauthorizedError(
                "Invalid authentication data. Please login again!"
            );

        // Fetch user info through gRPC
        let user;
        const resp = await getUser(payload._id);

        if (resp && resp.response.status === 200) {
            user = resp.response.user;
        } else {
            throw new Error("No user found!");
        }

        if (user.role !== payload.role)
            throw new UnauthorizedError(
                "You do not have permission to access this resource!"
            );

        next();
    } catch (err) {
        next(err);
    }
};
