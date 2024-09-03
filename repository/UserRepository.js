"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_server_1 = __importDefault(require("json-server"));
const path_1 = __importDefault(require("path"));
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const _utils_1 = require("../utils");
/**
 * this repository is temporary, please use real database to production mode
 */
const userRepository = json_server_1.default.router(path_1.default.resolve("db.json"));
const server = json_server_1.default.create();
const middleware = json_server_1.default.defaults();
server.use(middleware);
server.use(userRepository);
const adapter = new FileSync_1.default(path_1.default.resolve("db.json"));
const database = (0, lowdb_1.default)(adapter);
class UserRepository {
    save(credential) {
        this.createOrUpdate(credential);
    }
    findOne(user_id) {
        const credentials = database.get("credentials").value();
        const store = this.findValueFromProperty("user_id", credentials, user_id);
        if (!store) {
            throw new _utils_1.HttpErrorException("Read our documentation on how to authenticate your app").setStatusCode(404);
        }
        return store;
    }
    findFirst() {
        var _a;
        return (_a = database.get("credentials").value()) === null || _a === void 0 ? void 0 : _a[0];
    }
    createOrUpdate(data) {
        var _a;
        const credentials = (_a = database.get("credentials").value()) !== null && _a !== void 0 ? _a : [];
        const hasCredentials = this.findValueFromProperty("user_id", credentials, data.user_id);
        if (hasCredentials) {
            const index = credentials.findIndex((credential) => credential.user_id === data.user_id);
            credentials.splice(index, 1, data);
        }
        else {
            credentials === null || credentials === void 0 ? void 0 : credentials.push(data);
        }
        database.set("credentials", credentials).write();
    }
    findValueFromProperty(property, list, value) {
        const findValue = list === null || list === void 0 ? void 0 : list.find((values) => values[property] === Number(value));
        return findValue;
    }
}
exports.default = new UserRepository();
