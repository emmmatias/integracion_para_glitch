import { NextFunction, Request, Response } from "express";
export declare const checkUserCredentialsMiddleware: (_req: Request, res: Response, next: NextFunction, user_id: number) => Response | void;
