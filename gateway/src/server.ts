import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

// create app
const app = express();

// logging
app.use(morgan("dev"));

// env config
dotenv.config();

// cors origin policy
app.use(
    cors({
        origin: "http://localhost:5173/",
        allowedHeaders: ["Authorization", "Content-Type"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
);

// services
const services = {
    auth: "http://localhost:3000/",
    admin: "http://localhost:3001/",
};

// reverse proxy
app.use(
    "/api/auth",
    createProxyMiddleware({ target: services.auth, changeOrigin: true })
);
app.use(
    "/api/admin",
    createProxyMiddleware({ target: services.admin, changeOrigin: true })
);

// port
app.listen(process.env.PORT, () => {
    console.log(`api gateway is running on port ${process.env.PORT}`);
});
