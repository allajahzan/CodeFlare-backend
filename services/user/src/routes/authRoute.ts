import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "../controller/implementation/userController.";
import { UserService } from "../service/implementation/userService";
import { UserReporsitory } from "../repository/implementation/userRepository";
import User from "../modal/userSchema";

const router = Router();

// Dependency Injection
const userRepository = new UserReporsitory(User);
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

// Reset Password
router.post("/verify-otp", (req: Request, res: Response, next: NextFunction) =>
    userController.userResetPassword(req, res, next)
);

// Verify OTP
router.post("/reset-password", (req: Request, res: Response, next: NextFunction) =>
    userController.userVerifyOtp(req, res, next)
);

// User refresh token
router.post( "/refresh-token", (req: Request, res: Response, next: NextFunction) =>
        userController.refreshToken(req, res, next)
);

export { router as authRoute };
