import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../service/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import {
    HTTPStatusCodes,
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

            res.cookie("refreshToken", data.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 1000 * 60 * 60 * 24,
            });

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, {
                role: data.role,
                accessToken: data.accessToken,
            });
        } catch (err: any) {
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
            
            const data = await this.userService.userRegister(name, email, role, password);
            SendResponse(res, HTTPStatusCodes.CREATED, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
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
            const { email } = req.body;
            const { token } = req.query;

            await this.userService.userVerifyEmail(email, token as string);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Handles user OTP verification by calling the OTP verification service
     * @param req - The express request object containing the OTP in the body and the verification token in the query.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the verification process is complete.
     */
    async userVerifyOtp(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { otp } = req.body;
            const { token } = req.query;

            await this.userService.userVerifyOtp(otp, token as string);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS);
        } catch (err: any) {
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
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Retrieves the user data based on the x-user-id header.
     * @param req - The express request object containing the x-user-id header.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user data retrieval process is complete.
     */
    async getUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache"); // Clear cache

            const payload = req.headers["x-user-id"]; // Payload

            const data = await this.userService.getUser(payload as any);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Retrieves all users from the database by calling the user service.
     * @param req - The express request object.
     * @param res - The express response object used to send the list of users.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the retrieval process is complete.
     */
    async getStudents(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache"); // Clear cache

            const data = await this.userService.getUsers(["student"]); // Fetch users based on roles
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    async getCoordinatorsAndInstructors(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            res.setHeader("Cache-Control", "no-store, no-cache"); // Clear cache

            const data = await this.userService.getUsers([
                // Fetch users based on roles
                "coordinators",
                "instructors",
            ]);

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
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

            const data = await this.userService.createUser(user);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
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
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
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
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }
}
