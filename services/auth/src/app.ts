import express from "express";
import cookieParser from "cookie-parser";
import connection from "mongoose";
import { errorHandler } from "@codeflare/common";
// import route from "./routes/route";

// create app
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
// app.use("/", route);

app.use(errorHandler)

// export app
export default app;
