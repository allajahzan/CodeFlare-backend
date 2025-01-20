import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../service/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import { HTTPStatusCodes, ResponseMessage, SendResponse } from "@codeflare/common";

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
     * Handles user login requests by calling the user login service
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
            const { email, password } = req.body;

            const data = await this.userService.userLogin(email, password);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
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
            const { email, password, role } = req.body;

            const data = await this.userService.userRegister(email, password, role);
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
            const { email, role } = req.body;

            const data = await this.userService.userVerifyEmail(email, role);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Handles refresh token requests by calling the refresh token service.
     *
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
