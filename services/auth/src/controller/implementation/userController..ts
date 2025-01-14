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

    async userLogin(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password } = req.body;
            const data = this.userService.userLogin(email, password);
            SendResponse(res, HTTPStatusCodes.OK, "Login Successful", data);
        } catch (err) {
            next(err);
        }
    }
}
