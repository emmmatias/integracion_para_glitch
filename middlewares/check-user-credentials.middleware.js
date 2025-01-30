"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserCredentialsMiddleware = void 0;
const UserRepository_1 = __importDefault(require("../repository/UserRepository"));
const checkUserCredentialsMiddleware = (_req, res, next, user_id) => {
    try {
        UserRepository_1.default.findOne(+user_id);
        console.warn(`this json server not recommended to production mode`);
        next();
    }
    catch (e) {
        next(e);
    }
};
exports.checkUserCredentialsMiddleware = checkUserCredentialsMiddleware;
