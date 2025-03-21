import { Router } from "express";
import { attendenceRouter } from "./attendenceRouter";

const router = Router();

// Attendence router
router.use('/attendence', attendenceRouter)

export default router;