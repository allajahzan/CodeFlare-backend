import { Router } from "express";
import { authRoute } from "./authRoute";
import { userRoute } from "./userRoute";
import { checkAuth } from "../middleware/checkAuth";
import { profileRoute } from "./profileRoute";
const router = Router();

// authRoute
router.use("/", authRoute);

// userRoute
router.use("/", checkAuth, userRoute);

// profileRoute
router.use("/profile", checkAuth, profileRoute);

export default router;
