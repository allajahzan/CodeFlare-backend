import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";
import { checkAuth } from "./middleware/checkAuth";
import fileUpload from 'express-fileupload'

// create app
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload())

// Router
app.use('/', checkAuth, router)

// error handler
app.use(errorHandler);

// export app
export default app;
