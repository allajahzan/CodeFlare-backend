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
        } catch (err) {
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
            const { newUser, token } = req.body;
            const { _id, email, role } = newUser;

            const data = await this.userService.userRegister(_id, email, role, token);
            SendResponse(res, HTTPStatusCodes.CREATED, ResponseMessage.SUCCESS, data);
        } catch (err) {
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
        } catch (err) {
            next(err);
        }
    }
}
