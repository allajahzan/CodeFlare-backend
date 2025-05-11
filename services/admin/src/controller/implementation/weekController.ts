import { Request, Response, NextFunction } from "express";
import { IWeekService } from "../../service/interface/IWeekService";
import { IWeekController } from "../interface/IWeekController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Week Controller */
export class WeekController implements IWeekController {
    private weekService: IWeekService;

    /**
     * Constructs an instance of WeekController.
     * @param {IWeekService} weekService The service used for managing week data.
     */
    constructor(weekService: IWeekService) {
        this.weekService = weekService;
    }

    /**
     * Retrieves the list of weeks.
     * @returns A promise that resolves to a list of weeks as IWeekDto objects.
     * @throws {NotFoundError} If there is a problem retrieving the weeks.
     */
    async getWeeks(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const data = await this.weekService.getWeeks();

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Adds a new week to the database.
     * @param {Request} req The request object.
     * @param {Response} res The response object.
     * @param {NextFunction} next The next middleware to call in the stack.
     * @returns A promise that resolves to the newly added week as an IWeekDto object.
     * @throws {ConflictError} If the week with the given name already exists.
     * @throws {BadRequestError} If there is a problem adding the week to the database.
     */
    async addWeek(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { name } = req.body;

            const data = await this.weekService.addWeek(name);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the name of an existing week with the given weekId.
     * @param {Request} req The request object containing the weekId of the week to update in the request parameters, and the new name in the request body.
     * @param {Response} res The response object used to send the response.
     * @param {NextFunction} next The next middleware to call in the stack.
     * @returns A promise that resolves when the week is updated successfully.
     * @throws {ConflictError} If a week with the given name already exists.
     * @throws {BadRequestError} If there is a problem updating the week.
     */
    async updateWeek(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { weekId } = req.params;
            const { name } = req.body;

            await this.weekService.updateWeek(weekId, name);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Searches for weeks based on the given keyword from the request query.
     * @param req - The express request object containing the keyword, sort and order in the request query.
     * @param res - The express response object used to send the list of weeks.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the week search process is complete.
     * @throws An error if there is a problem searching for the weeks.
     */
    async searchWeeks(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { keyword, sort, order } = req.query;

            const data = await this.weekService.searchWeeks(
                keyword as string,
                sort as string,
                Number(order)
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }
}
