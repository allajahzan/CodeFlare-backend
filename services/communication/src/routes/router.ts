import { Router } from "express";
import { chatRoute } from "./chatRoute";
import { checkAuth } from "../middleware/checkAuth";
import { messageRoute } from "./messageRoute";
const router = Router();

// chatRoute
router.use("/chat", chatRoute);

// messageRoute
router.use("/message", messageRoute);

export default router;
