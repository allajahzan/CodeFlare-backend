import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../service/interface/IUserService";
import { IUserController } from "../interface/IUserContoller";
import {
    HTTPStatusCodes,
    NotFoundError,
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
     * Retrieves all users from the database.
     * @param req - The express request object.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user retrieval process is complete.
     */
    async getUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.userService.getUsers();
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Handles the creation of a new user by calling the user service.
     * @param req - The express request object containing the new user's details.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user creation process is complete.
     */
    async createUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = req.body;

            const data = await this.userService.createUser(user);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.CREATED, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Handles the update of an existing user by calling the user service.
     * @param req - The express request object containing the user's details to update.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user update process is complete.
     */
    async updateUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { _id, user } = req.body;

            const data = await this.userService.updateUser(_id, user);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Blocks a user by calling the user service.
     * @param req - The express request object containing the user ID to block.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the user blocking process is complete.
     */
    async changeUserStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { _id } = req.body;

            const data = await this.userService.changeUserStatus(_id);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Searches for users based on the provided query by calling the user service.
     * @param req - The express request object containing the search query in the query parameters.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the search process is complete.
     */
    async searchUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { query } = req.query;

            const data = await this.userService.searchUsers(query as string);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }
}
