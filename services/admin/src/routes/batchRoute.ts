import { NextFunction, Request, Response, Router } from "express";
import { BatchController } from "../controller/implementation/batchController";
import { BatchService } from "../service/implementation/batchService";
import { BatchRepository } from "../repository/implementation/batchRepository";
import Batch from "../modal/batch";

const router = Router();

// Dependency Injection
const batchRepository = new BatchRepository(Batch);
const batchService = new BatchService(batchRepository);
const batchController = new BatchController(batchService);

// Get batches
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    batchController.getBatches(req, res, next)
);

// Add batch
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    batchController.addBatch(req, res, next)
);

// Update batch
router.put("/", (req: Request, res: Response, next: NextFunction) =>
    batchController.updateBatch(req, res, next)
);

export { router as adminRoute };
