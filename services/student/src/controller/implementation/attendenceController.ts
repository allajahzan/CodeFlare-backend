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
            const { userId, activity } = req.query;

            const data = await this.attedenceService.checkInOut(
                userId as string,
                activity as string
            );
            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves attendance records for a student based on user ID and optional batch IDs.
     * @param {Request} req - The express request object containing user ID and batch IDs in the query parameters.
     * @param {Response} res - The express response object used to send the attendance data back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the attendance data is successfully retrieved and sent, or passes an error to the next middleware.
     */
    async getAttendence(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userId, batchIds } = req.query;

            const data = await this.attedenceService.getAttendence(
                userId as string,
                (batchIds as string).split(",")
            );

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Searches for attendance records for a student based on user ID, batch IDs, and date.
     * @param {Request} req - The express request object containing user ID, batch IDs, and date in the query parameters.
     * @param {Response} res - The express response object used to send the attendance data back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the attendance data is successfully retrieved and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async searchAttendece(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { batchIds, userId, date } = req.query;

            const data = await this.attedenceService.searchAttendece(
                userId as string,
                (batchIds as string).split(","),
                date as string
            );

            SendResponse(res, HTTPStatusCodes.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
