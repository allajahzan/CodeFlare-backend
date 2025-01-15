import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "../controller/implementation/userController";
import { UserService } from "../service/implementation/userService";
import { UserRepository } from "../repository/implementation/userRepository";
import User from "../modal/user";

const router = Router();

// Dependency Injection
const userReporsitory = new UserRepository(User);
const userService = new UserService(userReporsitory);
const userController = new UserController(userService);

// Create User
router.post("/user", (req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)
);

// Update User
router.put("/user", (req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(req, res, next)
);

// Change User Status
router.patch("/user", (req: Request, res: Response, next: NextFunction) =>
    userController.changeUserStatus(req, res, next)
);

// Search User
router.get("/user/search", (req: Request, res: Response, next: NextFunction) =>
    userController.searchUsers(req, res, next)
);

export { router as userRoute };
