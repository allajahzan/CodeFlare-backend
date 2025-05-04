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
        const tokenPayload = req.headers["x-user-payload"]; // Token payload from request header
        const userRole = req.headers["x-user-role"]; // User role from request header

        if (!tokenPayload || !userRole) {
            throw new UnauthorizedError("Authentication failed. Please login again!");
        }

        const payload = JSON.parse(tokenPayload as string) as JwtPayloadType;
        const role = JSON.parse(userRole as string);

        if (!payload) {
            throw new UnauthorizedError(
                "Invalid authentication data. Please login again!"
            );
        }

        if (role && role !== payload.role) {
            throw new UnauthorizedError(
                "You do not have permission to access this resource!"
            );
        }

        // Get user info through gRPC
        let user;

        const resp = await getUser(payload._id);

        if(resp.response && resp.response.status === 200){
            user = resp.response.user;
        }

        if (!user) {
            throw new NotFoundError("Account not found. Please contact support!");
        }

        if(user.isblock){
            throw new UnauthorizedError("Your account is blocked. Please contact support!");
        }

        next();
    } catch (err) {
        next(err);
    }
};
