import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";
import { checkAuth } from "./middleware/checkAuth";

// create app
const app = express();

// middlewares
app.use(express.json());

// routes
app.use("/", checkAuth, router);

// error handler
app.use(errorHandler);

// export app
export default app;
