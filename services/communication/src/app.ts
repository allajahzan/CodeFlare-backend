import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { checkAuth } from "./middleware/checkAuth";

// create app
const app = express();

// middlewares
app.use(express.json());

// Router
app.use('/', checkAuth, router)

// error handler
app.use(errorHandler);

// export app
export default app;
