import { NextFunction, Request, Response, Router } from "express";
import { AdminController } from "../controller/implementation/adminController";
import { AdminService } from "../service/implementation/adminService";
import { AdminRepositoty } from "../repository/implementation/adminRepository";
import Admin from "../modal/admin";

const router = Router();

// Dependency Injection
const adminRepository = new AdminRepositoty(Admin);
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

// Get admin
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    adminController.getAdmin(req, res, next)
);

// Update admin
router.put("/", (req: Request, res: Response, next: NextFunction) =>
    adminController.updateAdmin(req, res, next)
);

export { router as adminRoute };
