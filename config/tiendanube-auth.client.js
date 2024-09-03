"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiendanubeAuthClient = void 0;
const axios_1 = __importDefault(require("axios"));
const _utils_1 = require("../utils");
exports.tiendanubeAuthClient = axios_1.default.create({
    baseURL: process.env.TIENDANUBE_AUTENTICATION_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
exports.tiendanubeAuthClient.interceptors.request.use((config) => {
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    if (error.isAxiosError) {
        const { data } = error.response;
        const payload = new _utils_1.HttpErrorException("TiendanubeAuthClient - " + (data === null || data === void 0 ? void 0 : data.message), data === null || data === void 0 ? void 0 : data.description);
        payload.setStatusCode(data === null || data === void 0 ? void 0 : data.code);
        return Promise.reject(payload);
    }
    return Promise.reject(error);
});
exports.tiendanubeAuthClient.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data || {};
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.isAxiosError) {
        const { data } = error.response;
        const payload = new _utils_1.HttpErrorException("TiendanubeAuthClient - " + (data === null || data === void 0 ? void 0 : data.message), data === null || data === void 0 ? void 0 : data.description);
        payload.setStatusCode(data === null || data === void 0 ? void 0 : data.code);
        return Promise.reject(payload);
    }
    return Promise.reject(error);
});
