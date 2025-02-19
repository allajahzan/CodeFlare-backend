import { Router } from "express";
import { adminRoute } from "./batchRoute";

const router = Router();

// adminRoute
router.use("/batch", adminRoute)

export default router;
