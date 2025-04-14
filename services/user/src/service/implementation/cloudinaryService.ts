import cloudinary from "../../config/cloudinary";
import { ICloudinaryService } from "../interface/ICloudinaryService";

/** Implementation of Cloudinary service */
export class CloudinaryService implements ICloudinaryService {
    /**
     * Deletes an image from Cloudinary based on the provided public ID.
     * @param publicId - The public ID of the image to be deleted.
     * @returns A promise that resolves when the image is successfully deleted and sent, or passes an error to the next middleware.
     * @throws - Passes any errors to the next middleware.
     */
    async delelteImage(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err: unknown) {
            throw err;
        }
    }
}
