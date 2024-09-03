import { TiendanubeAuthInterface, LoginRequestInterface } from "@features/auth";
/**
 * In production mode, the back-end needs to implement its own authentication for the API.
 */
declare class AuthService {
    login(loginRequest: LoginRequestInterface): TiendanubeAuthInterface;
}
declare const _default: AuthService;
export default _default;
