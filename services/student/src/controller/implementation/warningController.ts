import {
    HTTPStatusCodes,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";
import { IWarningService } from "../../service/interface/IWarningService";
import { IWarningController } from "../interface/IWarningController";
import { Request, Response, NextFunction } from "express";

/** Implementation for Warning Controller */
export class WarningController implements IWarningController {
    private warningService: IWarningService;

    constructor(warningService: IWarningService) {
        this.warningService = warningService;
    }

    /**
     * Get warnings for a student of a perticular month and year.
     * @param {Request} req - Express request object containing the warning data in the body.
     * @param {Response} res - Express response object used to send the result back to the client.
     * @param {NextFunction} next - Express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     * @throws - Passes any errors to the next middleware.
     */
    async getWarnings(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userId, month, year } = req.query;

            const data = await this.warningService.getWarnings(
                userId as string,
                month as string,
                Number(year)
            );

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Creates a warning for a student in the system.
     * @param {Request} req - Express request object containing the warning data in the body.
     * @param {Response} res - Express response object used to send the result back to the client.
     * @param {NextFunction} next - Express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     * @throws - Passes any errors to the next middleware.
     */
    async createWarning(req: Request, res: Response, next: NextFunction) {
        try {
            const { warning } = req.body;

            const data = await this.warningService.createWarning(warning);

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Adds a reply to a specific warning in the system.
     * @param {Request} req - Express request object containing the warning ID and reply in the body.
     * @param {Response} res - Express response object used to send the result back to the client.
     * @param {NextFunction} next - Express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the reply is successfully added to the warning.
     * @throws - Passes any errors to the next middleware.
     */
    async replyToWarning(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { warningId, reply } = req.body;

            const data = await this.warningService.replyToWarning(warningId, reply);

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
