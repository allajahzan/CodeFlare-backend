import { NextFunction, Request, Response, Router } from "express";
import { DomainController } from "../controller/implementation/domainController";
import { DomainService } from "../service/implementation/domainService";
import { DomainRepository } from "../repository/implementation/domainRepository";
import Domain from "../modal/domain";

const router = Router();

// Dependendy injuction
const domainRepository = new DomainRepository(Domain);
const domainService = new DomainService(domainRepository);
const domainController = new DomainController(domainService);

// Search domains
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    domainController.searchDomains(req, res, next)
);

// Add domain
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    domainController.addDomain(req, res, next)
);

// Update domain
router.put("/:domainId", (req: Request, res: Response, next: NextFunction) =>
    domainController.updateDomain(req, res, next)
);

// Unlist domain
router.delete("/:domainId", (req: Request, res: Response, next: NextFunction) =>
    domainController.unlistDomain(req, res, next)
);

// Get weeks in domain
router.get("/:domainId/weeks", (req: Request, res: Response, next: NextFunction) =>
        domainController.getWeeksInDomain(req, res, next)
);

// Add weeks to domain
router.post("/:domainId/weeks", (req: Request, res: Response, next: NextFunction) =>
        domainController.addWeeksToDomain(req, res, next)
);

// Update week in domain
router.put("/:domainId/weeks/:weekId", (req: Request, res: Response, next: NextFunction) =>
        domainController.updateWeekInDomain(req, res, next)
);

// Unlist week in domain
router.delete("/:domainId/weeks/:weekId", (req: Request, res: Response, next: NextFunction) =>
        domainController.unlistWeekInDomain(req, res, next)
);

export { router as domainRoute };    