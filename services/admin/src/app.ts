import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";

// Create express app
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/", router);

// Error Handler
app.use(errorHandler);

// Export app
export default app;
