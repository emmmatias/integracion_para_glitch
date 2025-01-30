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
const _utils_1 = require("../../utils");
const product_1 = require("../product");
class ProductController {
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield product_1.ProductService.create(+req.user.user_id);
                return res.status(_utils_1.StatusCode.CREATED).json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getTotal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield product_1.ProductService.findAllCount(+req.user.user_id);
                return res.status(_utils_1.StatusCode.OK).json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield product_1.ProductService.findAll(+req.user.user_id);
                return res.status(_utils_1.StatusCode.OK).json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
    delete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield product_1.ProductService.delete(+req.user.user_id, req.params.id);
                return res.status(_utils_1.StatusCode.OK).json(data);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
exports.default = new ProductController();
