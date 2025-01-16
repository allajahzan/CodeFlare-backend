import { Request, Response, NextFunction } from "express";
import { IAdminService } from "../../service/interface/IAdminService";
import { IAdminController } from "../interface/IAdminController";
import {
    HTTPStatusCodes,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Admin Controller */
export class AdminController implements IAdminController {
    private adminService: IAdminService;

    /**
     * Constructs an instance of AdminController.
     * @param adminService - The admin service to use for performing operations on admins.
     */
    constructor(adminService: IAdminService) {
        this.adminService = adminService;
    }

    /**
     * Retrieves an admin's details based on the provided ID from the request parameters.
     * @param req - The express request object containing the admin ID in the request parameters.
     * @param res - The express response object to send the admin data.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the admin retrieval process is complete.
     */
    async getAdmin(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id: _id } = req.params;

            const data = await this.adminService.getAdmin(_id);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }

    /**
     * Updates an existing admin's details based on the provided ID from the request parameters.
     * @param req - The express request object containing the admin's details in the request body and the admin ID in the request parameters.
     * @param res - The express response object to send the updated admin data.
     * @param next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the admin update process is complete.
     */
    async updateAdmin(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const admin = req.body;
            const { id: _id } = req.params;

            const data = await this.adminService.updateAdmin(_id, admin);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: any) {
            next(err);
        }
    }
}
