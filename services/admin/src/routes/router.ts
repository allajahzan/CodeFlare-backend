import { Router } from "express";
import { userRoute } from "./userRoute";

const router = Router();

// userRoute
router.use("/users", userRoute);

export default router;
