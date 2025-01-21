import { Router } from "express";
import { authRoute } from "./authRoute";
import { userRoute } from "./userRoute";
import { checkAuth } from "../middleware/checkAuth";
const router = Router();

// authRoute
router.use("/", authRoute);

// userRoute
router.use("/", checkAuth, userRoute);

export default router;
