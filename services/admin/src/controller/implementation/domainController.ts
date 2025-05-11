import { Request, Response, NextFunction } from "express";
import { IDomainService } from "../../service/interface/IDomainService";
import { IDomainController } from "../interface/IDomainController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Domain Controller */
export class DomainController implements IDomainController {
    private domainService: IDomainService;

    /**
     * Constructs an instance of DomainController.
     * @param domainService - The domain service to use for performing operations on domains.
     */
    constructor(domainService: IDomainService) {
        this.domainService = domainService;
    }

    /**
     * Adds a new domain with the given name, imageUrl, and weeks to the database.
     * @param {Request} req The request object.
     * @param {Response} res The response object.
     * @param {NextFunction} next The next middleware to call in the stack.
     * @returns A promise that resolves to the newly added domain as an IDomainDto object.
     * @throws {ConflictError} If the domain with the given name already exists.
     * @throws {BadRequestError} If there is a problem adding the domain to the database.
     */
    async addDomain(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { name, weeks } = req.body;

            const data = await this.domainService.addDomain(name, weeks);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates a domain with the given id.
     * @param {Request} req The request object containing the domain id in the request parameters, and the new name and image url in the request body.
     * @param {Response} res The response object used to send the response.
     * @param {NextFunction} next The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the domain is updated successfully.
     * @throws {BadRequestError} If there is a problem updating the domain.
     */
    async updateDomain(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { domainId } = req.params;
            const { name, weeks } = req.body;

            const data = await this.domainService.updateDomain(domainId, name, weeks);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Unlists a domain by setting its isDomainListed flag to false.
     * @param {Request} req - The express request object containing the domain id in the request parameters.
     * @param {Response} res - The express response object used to send the success response.
     * @param {NextFunction} next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the domain is successfully unlisted.
     * @throws Passes any errors to the next middleware.
     */
    async unlistDomain(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { domainId } = req.params;

            await this.domainService.unlistDomain(domainId);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Retrieves the weeks associated with the specified domain.
     * @param {Request} req - The express request object containing the domain id in the request parameters.
     * @param {Response} res - The express response object used to send the domain's weeks.
     * @param {NextFunction} next - The next middleware function in the express stack, called in case of an error.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     * @throws {Error} - Passes any errors to the next middleware.
     */
    async getWeeksInDomain(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { domainId } = req.params;

            const data = await this.domainService.getWeeksInDomain(domainId);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err) {
            next(err);
        }
    }

    /**
     * Adds a list of weeks to the specified domain.
     * @param {Request} req - The express request object containing the domain id in the request parameters and the list of weeks in the request body.
     * @param {Response} res - The express response object used to send a success response.
     * @param {NextFunction} next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the weeks are successfully added to the domain.
     * @throws Passes any errors to the next middleware.
     */
    // async addWeeksToDomain(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Promise<void> {
    //     try {
    //         const { domainId } = req.params;
    //         const { weeks } = req.body;

    //         await this.domainService.addWeeksToDomain(domainId, weeks);

    //         SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }

    /**
     * Updates the title of a specific week in the domain's week list.
     * @param {Request} req The request object containing the domainId and weekId of the week to update in the request parameters, and the new title in the request body.
     * @param {Response} res The response object used to send the response.
     * @param {NextFunction} next The next middleware to call in the stack.
     * @returns A promise that resolves when the update operation is complete.
     * @throws {BadRequestError} If there is a problem updating the week in the domain.
     */
    // async updateWeekInDomain(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Promise<void> {
    //     try {
    //         const { domainId, weekId } = req.params;
    //         const { title } = req.body;

    //         await this.domainService.updateWeekInDomain(domainId, weekId, title);

    //         SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }

    /**
     * Unlists a specific week in the domain's week list.
     * @param {Request} req - The express request object containing the domainId and weekId in the request parameters.
     * @param {Response} res - The express response object used to send the success response.
     * @param {NextFunction} next - The next middleware function in the express stack, called in case of an error.
     * @returns A promise that resolves when the week is successfully unlisted.
     * @throws Passes any errors to the next middleware.
     */
    // async unlistWeekInDomain(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Promise<void> {
    //     try {
    //         const { domainId, weekId } = req.params;

    //         await this.domainService.unlistWeekInDomain(domainId, weekId);

    //         SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
    //     } catch (err: unknown) {
    //         next(err);
    //     }
    // }

    /**
     * Searches for domains based on the provided keyword, sorting field, and order.
     * @param {Request} req - The express request object containing the keyword, sort and order in the request parameters.
     * @param {Response} res - The express response object used to send the list of domains.
     * @param {NextFunction} next - The next middleware function in the express stack.
     * @returns A promise that resolves when the domain search process is complete.
     * @throws An error if there is a problem searching for the domains.
     */
    async searchDomains(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { keyword, sort, order } = req.query;

            const data = await this.domainService.searchDomains(
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
