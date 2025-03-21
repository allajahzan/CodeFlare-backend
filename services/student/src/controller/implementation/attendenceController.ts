import { Request, Response, NextFunction } from "express";
import { IAttendenceService } from "../../service/interface/IAttendenceService";
import { IAttendenceController } from "../interface/IAttendenceController";
import {
    HTTPStatusCodes,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Attendence Controller  */
export class AttendenceController implements IAttendenceController {
    private attedenceService: IAttendenceService;

    /**
     * Constructor for Attendence Controller
     * @param {IAttendenceService} attendenceService - Instance of attendence service
     */
    constructor(attendenceService: IAttendenceService) {
        this.attedenceService = attendenceService;
    }

    /**
     * Handles the check-in or check-out process for a student.
     * @param {Request} req - Express request object containing user ID and activity type ('checkIn' or 'checkOut') in params.
     * @param {Response} res - Express response object used to send the result back to the client.
     * @param {NextFunction} next - Express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     * @throws - Passes any errors to the next middleware.
     */
    async checkInOut(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userId, activity } = req.params;

            const data = await this.attedenceService.checkInOut(userId, activity);
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
