"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _repository_1 = require("../../repository");
/**
 * In production mode, the back-end needs to implement its own authentication for the API.
 */
class AuthService {
    login(loginRequest) {
        return _repository_1.userRepository.findFirst();
    }
}
exports.default = new AuthService();
