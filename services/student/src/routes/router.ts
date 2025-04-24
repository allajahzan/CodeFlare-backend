import { Router } from "express";
import { attendenceRouter } from "./attendenceRouter";
import { warningRouter } from "./warningRouter";

const router = Router();

// Attendence router
router.use("/attendence", attendenceRouter);

// Warning router
router.use("/warning", warningRouter);

export default router;
