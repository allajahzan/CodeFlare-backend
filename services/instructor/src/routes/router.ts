import { Router } from "express";
import { reviewRoute } from "./reviewRoutes";

const router = Router();

// Review route
router.use("/review", reviewRoute);

export default router;
