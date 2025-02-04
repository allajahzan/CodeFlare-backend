import {
    JwtPayloadType,
    NotFoundError,
    UnauthorizedError,
} from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
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

        console.log(payload);
        console.log(role);
        
        

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

        next();
    } catch (err) {
        console.log(err)
        next(err);
    }
};
