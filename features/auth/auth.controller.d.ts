import { NextFunction, Request, Response } from "express";
declare class AuthenticationController {
    install(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    login(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
declare const _default: AuthenticationController;
export default _default;
