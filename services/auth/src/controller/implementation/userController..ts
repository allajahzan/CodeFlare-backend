import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../service/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import { HTTPStatusCodes, SendResponse } from "@codeflare/common";

/** User Controller */
export class UserController implements IUserController {
    private userService: IUserService;

    /**
     * Constructs an instance of UserController.
     * @param userService - The user service to use for performing operations on users.
     */
    constructor(userService: IUserService) {
        this.userService = userService;
    }

    /**
     * Handles user login requests by calling the user login service
     *
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
            SendResponse(res, HTTPStatusCodes.OK, "Login Successful", data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Handles user registration requests by calling the user registration service
     *
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
            console.log(data);
            SendResponse(res, HTTPStatusCodes.CREATED, "Register Successful", data);
        } catch (err) {
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
            SendResponse(res, HTTPStatusCodes.OK, "Refresh Token", data);
        } catch (err) {
            next(err);
        }
    }
}