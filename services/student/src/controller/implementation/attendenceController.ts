import { Request, Response, NextFunction } from "express";
import { IAttendenceService } from "../../service/interface/IAttendenceService";
import { IAttendenceController } from "../interface/IAttendenceController";
import {
    HTTPStatusCode,
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
            const { userId, attendanceId, activity } = req.query;
            const { reason } = req.body;

            const data = await this.attedenceService.checkInOut(
                userId as string,
                activity as string,
                reason,
                attendanceId as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves attendance lists for a student based on user ID and optional batch IDs.
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
            const { userId, month, year } = req.query;

            const data = await this.attedenceService.getAttendence(
                userId as string,
                month as string,
                year as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Searches for attendance lists for a student based on user ID, batch IDs, and date.
     * @param {Request} req - The express request object containing user ID, batch IDs, and date in the query parameters.
     * @param {Response} res - The express response object used to send the attendance data back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the attendance data is successfully retrieved and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async searchAttendence(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { batchIds, userId, date, sort, order, filter } = req.query;

            const data = await this.attedenceService.searchAttendence(
                userId as string,
                (batchIds as string).split(","),
                date as string,
                sort as string,
                Number(order),
                filter as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Approves a check-in request by updating the attendance status to "Approved"
     * @param {Request} req - The express request object containing the attendance ID in the parameters.
     * @param {Response} res - The express response object used to send the response back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the check-in is successfully approved and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async approvalCheckIn(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tokenPayload = req.headers["x-user-payload"];

            const { attendanceId } = req.params;

            await this.attedenceService.approvalCheckIn(
                tokenPayload as string,
                attendanceId
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Uploads a snapshot of a student.
     * @param {Request} req - The express request object containing the user ID in the query parameters and the image URL in the request body.
     * @param {Response} res - The express response object used to send the response back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the snapshot is successfully uploaded and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async uploadSnapshot(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { userId } = req.params;
            const { imageUrl, location } = req.body;

            await this.attedenceService.uploadSnapshot(
                userId as string,
                imageUrl,
                location
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the status of an attendance record based on the attendance ID and status.
     * @param {Request} req - The express request object containing the attendance ID in the query parameters and the status in the request body.
     * @param {Response} res - The express response object used to send the response back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the attendance record is successfully updated and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async updateStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { attendenceId } = req.params;
            const { status, report } = req.body;

            const data = await this.attedenceService.updateStatus(
                attendenceId as string,
                status,
                report
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves a monthly overview of attendance records for a given user and batch IDs.
     * @param {Request} req - The express request object containing the user ID and batch IDs in the query parameters.
     * @param {Response} res - The express response object used to send the response back to the client.
     * @param {NextFunction} next - The express next middleware function for error handling.
     * @returns {Promise<void>} - A promise that resolves when the attendance records are successfully retrieved and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async getMonthlyAttendence(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { type, batchIds, userId, month, year, filter, skip, limit } =
                req.query;

            const data = await this.attedenceService.getMonthlyAttendence(
                type as string,
                userId as string,
                (batchIds as string).split(","),
                month as string,
                Number(year),
                filter as string,
                Number(skip),
                Number(limit)
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
