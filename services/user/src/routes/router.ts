import { Router } from "express";
import { authRoute } from "./authRoute";
import { userRoute } from "./userRoute";
import { checkAuth } from "../middleware/checkAuth";
import { profileRoute } from "./profileRoute";
import { cloudinaryRoute } from "./cloudinaryRoute";
const router = Router();

// authRoute
router.use("/", authRoute);

// userRoute
router.use("/", checkAuth, userRoute);

// profileRoute
router.use("/", checkAuth, profileRoute);

// cloudinaryRoute
router.use("/", checkAuth, cloudinaryRoute)

export default router;
