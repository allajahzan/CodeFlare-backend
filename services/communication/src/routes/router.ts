import { Router } from "express";
import { chatRoute } from "./chatRoute";
import { checkAuth } from "../middleware/checkAuth";
const router = Router();

// chatRoute
router.use("/chat", checkAuth, chatRoute);

export default router;
