import { envChecker } from "@codeflare/common";
/**
 * Checks if all the required environment variables are defined.
 * @returns {void} nothing
 */
export const isEnvDefined = () => {
    envChecker(process.env.PORT as string, "PORT");
    envChecker(process.env.MONGO_DB_URL as string, "MONDO_DB_URL");
    envChecker(process.env.JWT_REFRESH_TOKEN_SECRET as string, "JWT_REFRESH_TOKEN_SECRET");
    envChecker(process.env.JWT_ACCESS_TOKEN_SECRET as string, "JWT_ACCESS_TOKEN_SECRET");
};