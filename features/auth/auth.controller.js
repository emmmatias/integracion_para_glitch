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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _utils_1 = require("../../utils");
const auth_1 = require("../auth");
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let url = "https://vmpk47rv-8000.brs.devtunnels.ms/hook_stores";
const db_path = path_1.default.resolve(__dirname, 'users.db');
const vista_path = path_1.default.resolve(__dirname, '../../../vistas/registro.pug');
const carrier = {
    "name": "Flash Now Envíos",
    "callback_url": "https://vmpk47rv-8000.brs.devtunnels.ms/costos",
    "types": "ship"
};
const carrier_opt = {
    "code": "express",
    "name": "Servicio de envío Estándar 48hs",
    "allow_free_shipping": true
};
let data_tienda;
let datos_carrier;
// Verificar si el directorio tiene permisos de escritura
try {
    fs_1.default.accessSync(path_1.default.dirname(db_path), fs_1.default.constants.W_OK);
}
catch (err) {
    console.error('El directorio no tiene permisos de escritura:', err);
}
const user_db = new sqlite3_1.default.Database(db_path, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error en la conexión:', err);
    }
    else {
        console.log('Conexión a la base de datos establecida');
    }
});
class AuthenticationController {
    install(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield auth_1.InstallAppService.install(req.query.code);
                console.log(data);
                user_db.serialize(() => __awaiter(this, void 0, void 0, function* () {
                    user_db.run(`CREATE TABLE IF NOT EXISTS users (
          user_id TEXT NOT NULL,
          access_token TEXT NOT NULL,
          token_type TEXT NOT NULL,
          scope TEXT NOT NULL,
          saldo INTEGER,
          activo BOOLEAN,
          direccion TEXT NOT NULL,
          email TEXT NOT NULL,
          logo TEXT NOT NULL,
          whatsapp TEXT,
          contacto_tienda TEXT,
          metodo_pago TEXT,
          cp_tienda TEXT,
          phone TEXT
        )`, (err) => {
                        if (err) {
                            console.error('Error en la creación de la tabla:', err);
                            return next(err);
                        }
                        else {
                            console.log('Tabla creada o ya existe');
                        }
                    });
                    try {
                        const tiendaResponse = yield fetch(`https://api.tiendanube.com/v1/${data.user_id}/store`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authentication': `bearer ${data.access_token}`,
                                'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)'
                            }
                        });
                        if (!tiendaResponse.ok) {
                            throw new Error(`Error fetching store data: ${tiendaResponse.statusText}`);
                        }
                        data_tienda = yield tiendaResponse.json();
                        console.log(`ESTE ES EL OBJ DE LA LLAMADA DE LA TIENDA!! ${JSON.stringify(data_tienda)}`);
                    }
                    catch (fetchError) {
                        console.error('Error fetching store data:', fetchError);
                        return next(fetchError);
                    }
                    //creacion de los webhooks para pedidos
                    let webhoock = {
                        url,
                        event: "order/paid"
                    };
                    fetch(`https://api.tiendanube.com/v1/${data.user_id}/webhooks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication': `bearer ${data.access_token}`,
                            'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)'
                        },
                        body: JSON.stringify(webhoock)
                    });
                    //fin de la creacion de webhooks
                    const insert = `INSERT INTO users (user_id, access_token,contacto_tienda, token_type, scope, saldo, activo, direccion, email, logo, whatsapp, metodo_pago, cp_tienda, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    user_db.run(insert, [
                        data.user_id,
                        data.access_token,
                        data_tienda.contacto_tienda,
                        data.token_type,
                        data.scope,
                        0,
                        true,
                        data_tienda.address || 'No definido',
                        data_tienda.email || 'No definido',
                        data_tienda.logo || 'No definido',
                        data_tienda.phone || 'No definido',
                        data_tienda.metodo_pago || 'No definido',
                        data_tienda.cp_tienda || 'No definido',
                        data_tienda.whatsapp_phone_number || 'No definido'
                    ], (err) => __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            console.error('Error insertando usuario:', err);
                            return next(err);
                        }
                        else {
                            console.log('Usuario dado de alta exitosamente');
                            const headers = {
                                'Content-Type': 'application/json',
                                'Authentication': `bearer ${data.access_token}`,
                                'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)'
                            };
                            console.log(`token ${data.access_token}`);
                            try {
                                const carrierResponse = yield fetch(`https://api.tiendanube.com/v1/${data.user_id}/shipping_carriers`, {
                                    method: 'POST',
                                    headers: headers,
                                    body: JSON.stringify(carrier)
                                });
                                const res_json = yield carrierResponse.json();
                                console.log(res_json);
                                if (!res_json.id || !res_json.callback_url) {
                                    throw new Error("La respuesta de la API no contiene los datos esperados.");
                                }
                                datos_carrier = res_json;
                                user_db.serialize(() => {
                                    user_db.run(`CREATE TABLE IF NOT EXISTS carrier (
                  user_id TEXT NOT NULL,
                  call_back TEXT NOT NULL,
                  carrier_id NUMBER NOT NULL
                )`, (err) => err ? console.error(err) : console.log('Tabla de carrier activa'));
                                    user_db.run(`INSERT INTO carrier VALUES (?,?,?)`, [data.user_id, res_json.callback_url, res_json.id], (err) => {
                                        if (err) {
                                            console.error('Error insertando carrier:', err);
                                        }
                                    });
                                });
                                console.log(`peticion a la api en el carrier option: https://api.tiendanube.com/v1/${data.user_id}/shipping_carriers/${res_json.id}/options`);
                                const carrierOptResponse = yield fetch(`https://api.tiendanube.com/v1/${data.user_id}/shipping_carriers/${res_json.id}/options`, {
                                    method: 'POST',
                                    headers: headers,
                                    body: JSON.stringify(carrier_opt)
                                });
                                const carr_res = yield carrierOptResponse.json();
                                console.log(carr_res);
                            }
                            catch (fetchError) {
                                console.error('Error en la petición a la API de Tiendanube:', fetchError);
                                return next(fetchError);
                            }
                            return res.render(vista_path, {
                                id: data.user_id,
                                formaction: '/registro',
                                title: 'Alta Usuarios',
                                formTitle: 'Confirme sus datos de cuenta',
                                direccion: data_tienda.address || 'No definido',
                                whatsapp: data_tienda.whatsapp_phone_number || 'No definido',
                                telefono: data_tienda.phone || 'No definido',
                                email: data_tienda.email || 'No definido',
                            });
                            //return res.sendFile('../../../vistas/registro.html')
                            //return res.status(StatusCode.OK).json(data);
                        }
                    }));
                }));
            }
            catch (e) {
                return next(e);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = auth_1.AuthService.login(req.body);
                return res.status(_utils_1.StatusCode.OK).json(data);
            }
            catch (e) {
                return next(e);
            }
        });
    }
}
exports.default = new AuthenticationController();
