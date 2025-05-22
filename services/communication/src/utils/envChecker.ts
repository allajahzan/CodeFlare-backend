import { envChecker } from "@codeflare/common";
/**
 * Checks if all the required environment variables are defined.
 * @returns {void} nothing
 */
export const isEnvDefined = () => {
    envChecker(process.env.PORT as string, "PORT");
    envChecker(process.env.MONGO_DB_URL as string, "MONGO_DB_URL");
    envChecker(process.env.REDIS_URL as string, "REDIS_URL");
    envChecker(process.env.CLIENT_URL as string, "CLIENT_URL");
    envChecker(process.env.GRPC_URL as string, "GRPC_URL");
};
