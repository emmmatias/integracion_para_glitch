import { StatusCode } from "@utils";
export declare class HttpErrorException {
    message: string;
    description?: string;
    statusCode: StatusCode;
    constructor(message?: string, description?: string);
    setStatusCode(status?: number): HttpErrorException;
}
export declare class BadRequestException extends HttpErrorException {
    constructor(message: string, description?: string);
}
