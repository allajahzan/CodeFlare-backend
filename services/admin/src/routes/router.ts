import { Router } from "express";
import { batchRoute } from "./batchRoute";
import { weekRoute } from "./weekRoute";

const router = Router();

// batchRoute
router.use("/batch", batchRoute)

// weekRoute
router.use("/week", weekRoute)

export default router;
