import { TiendanubeAuthInterface } from "@features/auth";
declare class UserRepository {
    save(credential: TiendanubeAuthInterface): void;
    findOne(user_id: number): TiendanubeAuthInterface;
    findFirst(): TiendanubeAuthInterface;
    private createOrUpdate;
    private findValueFromProperty;
}
declare const _default: UserRepository;
export default _default;
