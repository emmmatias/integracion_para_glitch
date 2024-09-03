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
const product_mock_1 = require("../../features/product/__mock__/product.mock");
const _config_1 = require("../../config");
class ProductService {
    create(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomProduct = (0, product_mock_1.generateProductMock)();
            const data = yield _config_1.tiendanubeApiClient.post(`${user_id}/products`, randomProduct);
            return Object.assign({ id: data.id }, randomProduct);
        });
    }
    delete(user_id, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield _config_1.tiendanubeApiClient.delete(`${user_id}/products/${productId}`);
        });
    }
    findAll(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findAllFromApi(user_id);
        });
    }
    findAllCount(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                total: (yield this.findAllFromApi(user_id)).length,
            };
        });
    }
    findAllFromApi(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield _config_1.tiendanubeApiClient.get(`${user_id}/products`));
        });
    }
}
exports.default = new ProductService();
