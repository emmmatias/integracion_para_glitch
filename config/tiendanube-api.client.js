"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiendanubeApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const _repository_1 = require("../repository");
const _utils_1 = require("../utils");
exports.tiendanubeApiClient = axios_1.default.create({
    baseURL: process.env.TIENDANUBE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "User-Agent": `${process.env.CLIENT_ID} (${process.env.CLIENT_EMAIL})`,
    },
});
exports.tiendanubeApiClient.interceptors.request.use((config) => {
    var _a;
    // Do something before request is sent
    const { access_token } = _repository_1.userRepository.findOne(+((_a = config.url) === null || _a === void 0 ? void 0 : _a.split("/")[0]));
    config.headers["Authentication"] = `bearer ${access_token}`;
    return config;
}, function (error) {
    // Do something with request error
    if (error.isAxiosError) {
        const { data } = error.response;
        const payload = new _utils_1.HttpErrorException("TiendanubeApiClient - " + (data === null || data === void 0 ? void 0 : data.message), data === null || data === void 0 ? void 0 : data.description);
        payload.setStatusCode(data === null || data === void 0 ? void 0 : data.code);
        return Promise.reject(payload);
    }
    return Promise.reject(error);
});
exports.tiendanubeApiClient.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data || {};
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.isAxiosError) {
        const { data } = error.response;
        const payload = new _utils_1.HttpErrorException("tiendanubeApiClient - " + (data === null || data === void 0 ? void 0 : data.message), data === null || data === void 0 ? void 0 : data.description);
        payload.setStatusCode(data === null || data === void 0 ? void 0 : data.code);
        return Promise.reject(payload);
    }
    return Promise.reject(error);
});
