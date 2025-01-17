import { Router } from "express";
import { userRoute } from "./userRoute";
import { adminRoute } from "./adminRoute";

const router = Router();

// userRoute
router.use("/users", userRoute);

// adminRoute
router.use("/admin", adminRoute)

export default router;
