"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = exports.HttpErrorException = void 0;
const _utils_1 = require("./");
class HttpErrorException {
    constructor(message = HttpErrorException.name, description) {
        this.statusCode = _utils_1.StatusCode.INTERNAL_SERVER_ERROR;
        this.message = message;
        this.description = description;
    }
    setStatusCode(status = 500) {
        this.statusCode = status;
        return this;
    }
}
exports.HttpErrorException = HttpErrorException;
class BadRequestException extends HttpErrorException {
    constructor(message, description) {
        super(message, description);
        this.statusCode = _utils_1.StatusCode.BAD_REQUEST;
    }
}
exports.BadRequestException = BadRequestException;
