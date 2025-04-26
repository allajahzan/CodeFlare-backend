import { Router } from "express";
import { chatRoute } from "./chatRoute";
import { messageRoute } from "./messageRoute";
import { meetRoute } from "./meetRoute";
import { notifiactionRoute } from "./notificationRoute";
const router = Router();

// chatRoute
router.use("/chat", chatRoute);

// messageRoute
router.use("/message", messageRoute);

// meetRoute
router.use("/meet", meetRoute);

// notifiactionRoute
router.use("/notification", notifiactionRoute);

export default router;
