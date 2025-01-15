import { NextFunction, Request, Response, Router } from "express";
import { isAuthenticated } from "../middleware/authMiddleware";
import { UserController } from "../controller/implementation/userController.";
import { UserService } from "../service/implementation/userService";
import { UserRepository } from "../repository/implementation/userRepository";
import User from "../modal/user";

const router = Router();

// Dependency Injection
const userRepository = new UserRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// User Login
router.post("/login", (req: Request, res: Response, next: NextFunction) =>
    userController.userLogin(req, res, next)
);

// User Register
router.post("/register", (req: Request, res: Response, next: NextFunction) =>
    userController.userRegister(req, res, next)
);

// User Refresh Token
router.post(
    "/refresh-token",
    isAuthenticated,
    (req: Request, res: Response, next: NextFunction) =>
        userController.refreshToken(req, res, next)
);

export { router as userRoute };