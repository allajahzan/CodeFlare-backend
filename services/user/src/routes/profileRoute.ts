import { NextFunction, Request, Response, Router } from "express";
import { ProfileController } from "../controller/implementation/profileController";
import { ProfileService } from "../service/implementation/profileService";
import { UserRepository } from "../repository/implementation/userRepository";
import User from "../model/userSchema";
import { ProfileRepository } from "../repository/implementation/profileRepository";
import Profile from "../model/profileSchema";

const router = Router();

// Dependency Injection
const userRespository = new UserRepository(User);
const profileRepository = new ProfileRepository(Profile);
const profileService = new ProfileService(profileRepository, userRespository);
const profileController = new ProfileController(profileService);

// Get profile
router.get("/", (req: Request, res: Response, next: NextFunction) => {
    profileController.getProfileByUserId(req, res, next);
});

// Update profile
router.post("/", (req: Request, res: Response, next: NextFunction) => {
    profileController.updateProfileByUserId(req, res, next);
});

// Change profile pic
router.patch("/", (req: Request, res: Response, next: NextFunction) => {
    profileController.changeProfilePic(req, res, next);
});

export { router as profileRoute };
