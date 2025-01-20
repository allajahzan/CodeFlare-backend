import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";

// create app
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/", router);

// error handler
app.use(errorHandler);

// export app
export default app;
