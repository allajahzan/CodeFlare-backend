import express from "express";
import { errorHandler } from "@codeflare/common";

// create app
const app = express();

// middlewares
app.use(express.json());

// error handler
app.use(errorHandler);

// export app
export default app;
