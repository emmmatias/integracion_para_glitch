import { TiendanubeAuthInterface } from "@features/auth";
declare class InstallAppService {
    install(code: string): Promise<TiendanubeAuthInterface>;
    private authenticateApp;
}
declare const _default: InstallAppService;
export default _default;
