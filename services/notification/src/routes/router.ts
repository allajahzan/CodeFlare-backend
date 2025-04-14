import { Router } from "express";
import { notificationRoute } from "./notificationRoute";

const router = Router();

// notificationRoute
router.use("/", notificationRoute);

export default router;
