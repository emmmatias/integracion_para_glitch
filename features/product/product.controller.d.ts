import { NextFunction, Request, Response } from "express";
export interface ProductRequest extends Request {
    user: {
        user_id: number;
    };
}
declare class ProductController {
    create(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getTotal(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
declare const _default: ProductController;
export default _default;
