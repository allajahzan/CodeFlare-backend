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

// User login
router.post("/login", (req: Request, res: Response, next: NextFunction) =>
    userController.userLogin(req, res, next)
);

// User register
router.post("/register", (req: Request, res: Response, next: NextFunction) =>
    userController.userRegister(req, res, next)
);

// Verify email
router.post("/verify-email", (req: Request, res: Response, next: NextFunction) =>
        userController.userVerifyEmail(req, res, next)
);

// Check reset password link
router.get("/check-reset-password-link", (req: Request, res: Response, next: NextFunction) =>
        userController.checkResetPasswordLink(req, res, next)
);

// Reset password
router.post("/reset-password", (req: Request, res: Response, next: NextFunction) =>
    userController.userResetPassword(req, res, next)
);

// User refresh token
router.get( "/refresh-token", (req: Request, res: Response, next: NextFunction) =>
        userController.refreshToken(req, res, next)
);

// User logout
router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
    userController.userLogout(req, res, next)
);

export { router as authRoute };
