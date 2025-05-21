import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../service/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import {
    HTTPStatusCode,
    IRole,
    IStudentCategory,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of User Controller */
export class UserController implements IUserController {
    private userService: IUserService;

    /**
     * Constructs an instance of UserController.
     * @param userService - The user service to use ofr performing operations on users.
     */
    constructor(userService: IUserService) {
        this.userService = userService;
    }

    /**
     * Handles user login requests by calling the user login service.
     * @param req - The express request object containing user login details.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the login process is complete.
     */
    async userLogin(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password, role } = req.body;

            const data = await this.userService.userLogin(email, password, role);

            // Set refresh token in cookie
            res.cookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 1000 * 60 * 60 * 24,
            });

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, {
                role: data.role,
                accessToken: data.accessToken,
            });
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Handles user registration requests by calling the user registration service
     * @param req - The express request object containing user registration details.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the registration process is complete.
     */
    async userRegister(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { name, email, role, password } = req.body;

            const data = await this.userService.userRegister(
                name,
                email,
                role,
                password
            );

            return SendResponse(
                res,
                HTTPStatusCode.CREATED,
                ResponseMessage.SUCCESS,
                data
            );
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Handles user email verification by calling the user verification service
     * @param req - The express request object containing the user's email and role.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the verification process is complete.
     */
    async userVerifyEmail(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, role } = req.body;

            await this.userService.userVerifyEmail(email, role);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Handles checking the reset password link by calling the user reset password service
     * @param req - The express request object containing the reset password link token.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the reset password link is verified successfully.
     */
    async checkResetPasswordLink(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache"); // Clear cache

            const { token } = req.query;

            await this.userService.checkResetPasswordLink(token as string);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Handles user password reset requests by calling the password reset service.
     * @param req - The express request object containing the new password and confirmation in the body, and the reset token in the query.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the password reset process is complete.
     */
    async userResetPassword(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { password, confirmPassword } = req.body;
            const { token } = req.query;

            await this.userService.userResetPassword(password, token as string);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Handles refresh token requests by calling the refresh token service.
     * @param req - The express request object containing the refresh token in cookies.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the refresh token process is complete.
     */
    async refreshToken(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            const data = await this.userService.refreshToken(refreshToken);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Handles logout requests by calling the logout service.
     * @param req - The express request object.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the logout process is complete.
     */
    async userLogout(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.clearCookie("refreshToken"); // Clear refresh token
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves a user with given _id or batchId from the query parameters,
     * or the user with the token payload from the x-user-payload header if no query parameters are given.
     * @param req - The express request object.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user retrieval process is complete.
     */
    async getUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache"); // Clear cache

            const userQuery =
                req.query._id || req.query.batchId
                    ? JSON.stringify(req.query)
                    : req.headers["x-user-payload"]; // Token payload from request header

            const data = await this.userService.getUser(userQuery as string);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves a list of users based on the requester's token payload.
     * @param req - The express request object containing headers with token payload.
     * @param res - The express response object used to send the list of users.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user list retrieval process is complete.
     */
    async getUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache"); // Clear cache

            const tokenPayload = req.headers["x-user-payload"]; // Token payload from request header

            const data = await this.userService.getUsers(tokenPayload as string);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Creates a new user in the database by calling the user service.
     * @param req - The express request object containing the user to create.
     * @param res - The express response object used to send the newly created user.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the creation process is complete.
     */
    async createUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = req.body;

            const tokenPayload = req.headers["x-user-payload"]; // Token payload from request header

            const data = await this.userService.createUser(
                user,
                tokenPayload as string
            );

            SendResponse(res, HTTPStatusCode.CREATED, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates an existing user's details based on the provided ID from the request parameters.
     * @param req - The express request object containing the user details in the request body and the user ID in the request parameters.
     * @param res - The express response object to send the updated user data.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the user update process is complete.
     */
    async updateUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id: _id } = req.params;
            const user = req.body;

            const data = await this.userService.updateUser(_id, user);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Changes the status of a user with the given _id.
     * @param req - The express request object containing the user ID in the request parameters.
     * @param res - The express response object to send the updated user data.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the user status change process is complete.
     */
    async changeUserStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id: _id } = req.params;

            const data = await this.userService.changeUserStatus(_id);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Selects a domain for the user with the given user id from the token payload.
     * @param req - The express request object containing the domain id in the request body.
     * @param res - The express response object used to send the response.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves if the domain is selected successfully, otherwise rejects with an error.
     * @throws {UnauthorizedError} If the token payload is invalid or not provided.
     */
    async selectDomain(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { domainId } = req.body;

            const tokenPayload = req.headers["x-user-payload"]; // Token payload from request header

            await this.userService.selectDomain(tokenPayload as string, domainId);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Searches for users based on the given keyword from the request query.
     * @param req - The express request object containing the keyword in the request query.
     * @param res - The express response object used to send the list of users.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the user search process is complete.
     */
    async searchUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                keyword,
                isBlock,
                sort,
                order,
                roleWise,
                category,
                batchId,
                weekId,
                domainId,
            } = req.query;
            const tokenPayload = req.headers["x-user-payload"]; // Token payload from request header

            const data = await this.userService.searchUsers(
                tokenPayload as string,
                keyword as string,
                isBlock as string,
                sort as string,
                Number(order as string),
                roleWise as IRole,
                category as IStudentCategory,
                batchId as string,
                weekId as string,
                domainId as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves the count of users matching the given criteria.
     * @param req - The express request object containing the criteria in the query parameters.
     * @param res - The express response object used to send the count of users.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user count retrieval process is complete.
     */
    async getUsersCount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { batchId, weekId, domainId } = req.query;

            const tokenPayload = req.headers["x-user-payload"]; // Token payload from request header

            const data = await this.userService.getUsersCount(
                tokenPayload as string,
                batchId as string,
                weekId as string,
                domainId as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
