import { IProductResponse } from "@features/product";
declare class ProductService {
    create(user_id: number): Promise<IProductResponse>;
    delete(user_id: number, productId: string): Promise<any>;
    findAll(user_id: number): Promise<IProductResponse[]>;
    findAllCount(user_id: number): Promise<{
        total: number;
    }>;
    private findAllFromApi;
}
declare const _default: ProductService;
export default _default;
