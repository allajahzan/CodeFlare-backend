import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "@codeflare/common";
import { verifyToken } from "./middleware/verifyToken";
import {logger, morganMiddleware} from './middleware/centralized-logging'

// Create app
const app = express();

// Centralized Logging
app.use(morganMiddleware)

// Env config
dotenv.config();

// Cors origin policy
app.use(
    cors({
        origin: "http://localhost:5173",
        allowedHeaders: ["Authorization", "Content-Type", "x-user-role"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials : true
    })
);

// Services
const services = {
    auth: "http://localhost:3000/",
    admin: "http://localhost:3001/",
};

// Verify access token
app.use(verifyToken)

// Reverse proxy
app.use(
    "/api/user",
    createProxyMiddleware({ target: services.auth, changeOrigin: true })
);
app.use(
    "/api/admin",
    createProxyMiddleware({ target: services.admin, changeOrigin: true })
);

// Error handler
app.use(errorHandler)

// Port listening
app.listen(process.env.PORT, () => {
    logger.info(`api gateway is running on port ${process.env.PORT}`);
});
