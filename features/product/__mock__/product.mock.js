"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProductMock = void 0;
const faker_1 = require("@faker-js/faker");
const generateProductMock = () => {
    return {
        images: [
            {
                src: faker_1.faker.image.abstract(72, 72, true),
            },
        ],
        name: {
            en: faker_1.faker.commerce.productName(),
            pt: faker_1.faker.commerce.productName(),
            es: faker_1.faker.commerce.productName(),
        },
    };
};
exports.generateProductMock = generateProductMock;
