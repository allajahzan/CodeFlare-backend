import { Router } from "express";
import { batchRoute } from "./batchRoute";
import { weekRoute } from "./weekRoute";
import { domainRoute } from "./domainRoute";

const router = Router();

// batchRoute
router.use("/batch", batchRoute)

// weekRoute
router.use("/week", weekRoute)

// domainRoute
router.use("/domain", domainRoute)

export default router;
