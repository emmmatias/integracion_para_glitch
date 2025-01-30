"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeCheckClientMiddleware = void 0;
const _utils_1 = require("../utils");
const requiredEnvKeys = [
    "TIENDANUBE_AUTENTICATION_URL",
    "TIENDANUBE_API_URL",
    "CLIENT_SECRET",
    "CLIENT_ID",
    "CLIENT_EMAIL",
];
const beforeCheckClientMiddleware = (req, _res, next) => {
    const errors = [];
    for (const key of requiredEnvKeys) {
        if (!process.env[key])
            errors.push(key);
    }
    if (errors.length > 0) {
        const message = "It is necessary to set request variables at .env-example file and rename it to .env";
        return next(new _utils_1.HttpErrorException(message, `envs: [${errors.join(",")}] is required`));
    }
    return next();
};
exports.beforeCheckClientMiddleware = beforeCheckClientMiddleware;
