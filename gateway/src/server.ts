import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, verifyAccessToken } from "@codeflare/common";

// Create app
const app = express();

// Logging
app.use(morgan("dev"));

// Env config
dotenv.config();

// Cors origin policy
app.use(
    cors({
        origin: "http://localhost:5173",
        allowedHeaders: ["Authorization", "Content-Type"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials : true
    })
);

// Services
const services = {
    auth: "http://localhost:3000/",
    admin: "http://localhost:3001/",
};

// Reverse proxy
app.use(
    "/api/auth",
    createProxyMiddleware({ target: services.auth, changeOrigin: true })
);
app.use(
    "/api/admin",
    verifyAccessToken(process.env.JWT_ACCESS_TOKEN_SECRET as string),
    createProxyMiddleware({ target: services.admin, changeOrigin: true })
);

// Error handler
app.use(errorHandler)

// Port listening
app.listen(process.env.PORT, () => {
    console.log(`api gateway is running on port ${process.env.PORT}`);
});
