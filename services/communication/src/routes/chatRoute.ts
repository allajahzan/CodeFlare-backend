import { NextFunction, Request, Response, Router } from "express";

const router = Router();

router.post(
    "/",
    (req: Request, res: Response, next: NextFunction) => {
        console.log("asdf");
        res.end();
    }
);

export { router as chatRoute };
