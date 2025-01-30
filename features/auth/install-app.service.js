"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _config_1 = require("../../config");
const _utils_1 = require("../../utils");
const _repository_1 = require("../../repository");
class InstallAppService {
    install(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!code) {
                throw new _utils_1.BadRequestException("The authorization code not found");
            }
            const body = {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
            };
            const authenticateResponse = yield this.authenticateApp(body);
            // This condition will be true when the code has been used or is invalid.
            if (authenticateResponse.error && authenticateResponse.error_description) {
                throw new _utils_1.BadRequestException(authenticateResponse.error, authenticateResponse.error_description);
            }
            // Insert response of Authentication API at db.json file
            _repository_1.userRepository.save(authenticateResponse);
            return authenticateResponse;
        });
    }
    authenticateApp(body) {
        return __awaiter(this, void 0, void 0, function* () {
            return _config_1.tiendanubeAuthClient.post("/", body);
        });
    }
}
exports.default = new InstallAppService();
