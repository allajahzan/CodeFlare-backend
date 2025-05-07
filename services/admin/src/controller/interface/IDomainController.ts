import { NextFunction, Request, Response } from "express";

/** Interface for Domain Controller */
export interface IDomainController {
    addDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    updateDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    unlistDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    getWeeksInDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    addWeeksToDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    updateWeekInDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    unlistWeekInDomain(req:Request, res:Response, next: NextFunction): Promise<void>;
    searchDomains(req:Request, res:Response, next: NextFunction): Promise<void>;
}
