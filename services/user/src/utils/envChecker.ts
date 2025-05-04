import { envChecker } from "@codeflare/common";
/**
 * Checks if all the required environment variables are defined.
 * @returns {void} nothing
 */
export const isEnvDefined = () => {
    envChecker(process.env.PORT as string, "PORT");
    envChecker(process.env.MONGO_DB_URL as string, "MONGO_DB_URL");
    envChecker(process.env.JWT_REFRESH_TOKEN_SECRET as string, "JWT_REFRESH_TOKEN_SECRET");
    envChecker(process.env.JWT_ACCESS_TOKEN_SECRET as string, "JWT_ACCESS_TOKEN_SECRET");
    envChecker(process.env.GRPC_URL as string, "GRPC_URL");
    envChecker(process.env.REDIS_URL as string, "REDIS_URL");
    envChecker(process.env.CLIENT_URL as string, "CLIENT_URL");

    // Cloudinary
    envChecker(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string, "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    envChecker(process.env.CLOUDINARY_API_KEY as string, "CLOUDINARY_API_KEY");
    envChecker(process.env.CLOUDINARY_API_SECRET as string, "CLOUDINARY_API_SECRET");
};
