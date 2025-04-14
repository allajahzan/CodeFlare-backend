/** Interface for Cloudinary Service */
export interface ICloudinaryService {
    delelteImage(publicId: string): Promise<void>;
}
