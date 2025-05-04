import { Request, Response, NextFunction } from "express";
import { ICloudinaryController } from "../interface/ICloudinaryController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";
import { ICloudinaryService } from "../../service/interface/ICloudinaryService";

/** Implementaion of Cloudinary Controller */
export class CloudinaryController implements ICloudinaryController {
    private cloudinaryService: ICloudinaryService;

    constructor(cloudinaryService: ICloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Deletes an image from Cloudinary based on the provided public IP address.
     * @param req - The express request object containing the public IP address in the query parameters.
     * @param res - The express response object used to send the response back to the client.
     * @param next - The express next middleware function for error handling.
     * @returns A promise that resolves when the image is successfully deleted and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async deleteImage(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { public_id } = req.query;

            await this.cloudinaryService.delelteImage(public_id as string);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
