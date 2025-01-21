import { Router } from "express";
import { adminRoute } from "./adminRoute";

const router = Router();

// adminRoute
router.use("/admin", adminRoute)

export default router;
