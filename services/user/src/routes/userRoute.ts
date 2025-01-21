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

// Get students
router.get("/student", (req: Request, res: Response, next: NextFunction) =>
    userController.getStudents(req, res, next)
);

// Get Coordinators and Instructors
router.get("/coordinator-instructor", (req: Request, res: Response, next: NextFunction) =>
        userController.getCoordinatorsAndInstructors(req, res, next)
);

// Get user
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    userController.getUser(req, res, next)
);

// Create user
router.post("/", (req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)
);

// Update user
router.put("/", (req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(req, res, next)
);

// Change user status
router.patch("/", (req: Request, res: Response, next: NextFunction) =>
    userController.changeUserStatus(req, res, next)
);

export { router as userRoute };
