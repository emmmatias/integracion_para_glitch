import { Request, Response, NextFunction } from "express";
export declare const errorHandlingMiddleware: (err: any, req: Request, res: Response, next: NextFunction) => void | Response;
