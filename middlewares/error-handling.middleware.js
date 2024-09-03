"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlingMiddleware = void 0;
const _utils_1 = require("../utils");
const errorHandlingMiddleware = (err, req, res, next) => {
    if (!err) {
        return next();
    }
    if (err instanceof _utils_1.HttpErrorException) {
        return res.status(err.statusCode).json(err);
    }
    if (err.hasOwnProperty("error") && err.hasOwnProperty("error_description")) {
        const payload = new _utils_1.BadRequestException(err.error, err.error_description);
        return res.status(payload.statusCode).json(payload);
    }
    const payload = new _utils_1.HttpErrorException("Internal Server Error", err.message || JSON.stringify(err));
    return res.status(payload.statusCode).json(payload);
};
exports.errorHandlingMiddleware = errorHandlingMiddleware;
