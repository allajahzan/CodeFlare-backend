import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "../controller/implementation/userController";
import { UserService } from "../service/implementation/userService";
import { UserRepository } from "../repository/implementation/userRepository";
import User from "../model/userSchema";

const router = Router();

// Dependency Injection
const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Get user
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    userController.getUser(req, res, next)
);

// Get users
router.get("/users", (req: Request, res: Response, next: NextFunction) =>
    userController.getUsers(req, res, next)
);

// Search users
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
    userController.searchUsers(req, res, next)
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
router.patch("/status/:id", (req: Request, res: Response, next: NextFunction) =>
    userController.changeUserStatus(req, res, next)
);

// Select domain
router.patch("/select-domain", (req: Request, res: Response, next: NextFunction) =>
    userController.selectDomain(req, res, next)
);

// Get users count
router.get("/count", (req: Request, res: Response, next: NextFunction) =>
    userController.getUsersCount(req, res, next)
)

export { router as userRoute };
