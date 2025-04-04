import { Router } from "express";
import { chatRoute } from "./chatRoute";
import { messageRoute } from "./messageRoute";
import { meetRoute } from "./meetRoute";
const router = Router();

// chatRoute
router.use("/chat", chatRoute);

// messageRoute
router.use("/message", messageRoute);

// meetRoute
router.use("/meet", meetRoute);

export default router;
