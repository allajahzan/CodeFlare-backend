import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../../service/interface/IProfileService";
import { IProfileController } from "../interface/IProfileController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation of Profile Controller */
export class ProfileController implements IProfileController {
    private profileService: IProfileService;

    /**
     * Constructs an instance of ProfileController.
     * @param profileService - The profile service to use for performing operations on profiles.
     */
    constructor(profileService: IProfileService) {
        this.profileService = profileService;
    }

    /**
     * Retrieves the profile of a user with the given user id from the token payload.
     * @param req - The express request object containing the x-user-payload header.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the profile is retrieved successfully.
     * @throws An error if there is a problem retrieving the profile.
     */
    async getProfileByUserId(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const tokenPayload = req.headers["x-user-payload"];

            const data = await this.profileService.getProfileByUserId(
                tokenPayload as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the profile of a user with the given user id from the token payload.
     * @param req - The express request object containing the profile to update in the body and the token payload in the x-user-payload header.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the profile is updated successfully.
     * @throws An error if there is a problem updating the profile.
     */
    async updateProfileByUserId(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const profile = req.body;
            const tokenPayload = req.headers["x-user-payload"];

            await this.profileService.updateProfileByUserId(
                tokenPayload as string,
                profile
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the profile picture of a user based on the provided image URL and user id from the token payload.
     * @param req - The express request object containing the image URL in the body and the token payload in the x-user-payload header.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the profile picture is updated successfully.
     * @throws An error if there is a problem updating the profile picture.
     */
    async changeProfilePic(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const imageUrl = req.body.imageUrl;
            const tokenPayload = req.headers["x-user-payload"];

            this.profileService.changeProfilePic(tokenPayload as string, imageUrl);
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    /**
     * Updates the user's password based on the provided current and new passwords.
     * @param req - The express request object containing the current and new passwords in the body, and the token payload in the x-user-payload header.
     * @param res - The express response object.
     * @param next - The next middleware function in the express stack.
     * @returns A promise that resolves when the password is updated successfully.
     * @throws An error if there is a problem updating the password.
     */
    async changePassword(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { currentPassword, newPassword } = req.body;
            const tokenPayload = req.headers["x-user-payload"];

            await this.profileService.changePassword(
                tokenPayload as string,
                currentPassword,
                newPassword
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
