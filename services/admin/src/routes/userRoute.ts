import { NextFunction, Request, response, Response, Router } from "express";
import { UserController } from "../controller/implementation/userController";
import { UserService } from "../service/implementation/userService";
import { UserRepository } from "../repository/implementation/userRepository";
import User from "../modal/user";

const router = Router();

// Dependency Injection
const userReporsitory = new UserRepository(User);
const userService = new UserService(userReporsitory);
const userController = new UserController(userService);

// Get all users
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    userController.getUsers(req, res, next)
);

// Create user
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)
);

// Update user
router.put("/:id", (req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(req, res, next)
);

// Change user status
router.patch("/user:id/status", (req: Request, res: Response, next: NextFunction) =>
    userController.changeUserStatus(req, res, next)
);

// Search user
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    userController.searchUsers(req, res, next)
);

export { router as userRoute };
