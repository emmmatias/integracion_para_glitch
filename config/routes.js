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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../features/auth");
const product_1 = require("../features/product");
const sqlite3_1 = __importDefault(require("sqlite3"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
let saldo = 0;

let valores = [];
let date = new Date();
let mañana = date.setDate(date.getDate() + 1);
let pasado_mañana = date.setDate(date.getDate() + 2);
let data;
let row;
let db_precios = path_1.default.join(__dirname, '../features/auth/precios.db');
let db_path = path_1.default.join(__dirname, '../features/auth/users.db');
let pedidos_hook = 'https://vmpk47rv-8000.brs.devtunnels.ms/envios_hook';
const user_db = new sqlite3_1.default.Database(db_path, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error en la conexión:', err);
    }
    else {
        console.log('Conexión a la base de datos establecida');
    }
});
const routes = (0, express_1.Router)();

routes.get("/", (req, res) =>{
    res.send("hola")
})
routes.post("/registro", (req, res) => {
    console.log(req.body);
    let direccion = req.body.direccion;
    let contacto_tienda = req.body.contacto_tienda;
    let user_id = req.body.id;
    let cp_tienda = req.body.cp_tienda;
    let metodo_pago = req.body.metodo_pago;
    let email = req.body.email;
    let telefono = req.body.telefono;
    let whatsapp = req.body.whatsapp;
    user_db.run('UPDATE users set direccion = ?, cp_tienda = ?, metodo_pago = ?, contacto_tienda = ?, email = ?, whatsapp = ?, phone = ? WHERE user_id = ?', [direccion, cp_tienda, metodo_pago, contacto_tienda, email, whatsapp, telefono, user_id], (err) => {
        if (err) {
            console.error(err);
        }
        else {
            res.send('gracias');
        }
    });
    //res.render('usuario')
});
routes.post('envios_hook', (req, res) => {
    let id_pedido = req.body;
    console.log(`NUEVO ENVIO DESDE EL HOOK`);
    console.log(id_pedido);
    res.statusCode = 200;
    res.end('proceso con exito');
});
routes.get('/modif', (req, res) => {
    user_db.serialize(() => {
        //user_db.run('UPDATE users set saldo = 0')
        //user_db.run('delete from pedidos')
        //user_db.run('drop table pedidos')
        user_db.run(`CREATE TABLE IF NOT EXISTS pedidos (
  fecha_retiro TEXT,
  id_tienda NUMBER,
  contacto_tienda TEXT,
  direccion_tienda TEXT,
  telefono_tienda TEXT,
  fecha_entrega TEXT,
  precio_envio TEXT,
  nombre_cliente TEXT,
  direccion_cliente TEXT,
  telefono_cliente TEXT,
  observaciones TEXT, 
  metodo_pago TEXT,
  seguimiento TEXT
  )`);
    });
    res.send('cambio realizado');
});
//webhooks obligatorios
routes.post("/hook", (req, res) => {
    let hook_json = path_1.default.join(__dirname, "hook.json");
    console.log(hook_json);
    let js = JSON.parse(fs_1.default.readFileSync(hook_json, 'utf-8'));
    fs_1.default.writeFileSync(hook_json, js.hooks.push(req.body));
    res.statusCode = 200;
    res.end('proceso con exito');
});
routes.post("/hook_stores", (req, res) => {
    let hook_json = path_1.default.join(__dirname, "hook.json");
    console.log(hook_json);
    // Leer el contenido del archivo
    let data = fs_1.default.readFileSync(hook_json, 'utf-8');
    let js = JSON.parse(data);
    // Agregar el nuevo webhook
    js.hooks.push(req.body);
    // Escribir el contenido actualizado de vuelta al archivo
    fs_1.default.writeFileSync(hook_json, JSON.stringify(js, null, 2));
    res.status(200).send('Proceso con éxito');
});
//ruta para modificar los estados de envíos desde GUI
routes.get('/status_client', (req, res) => {
    let estados = ["dispatched", "received_by_post_office", "in_transit", "out_for_delivery", "delivery_attempt_failed", "delayed", "ready_for_pickup", "delivered", "returned_to_sender", "lost", "failure"];
});
//ruta para usuarios dentro de tienda nube
routes.get("/users/:id", (req, res) => {
});
routes.get("/reservas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    let ids = req.query.id;
    console.log(typeof (ids));
    let store_data;
    const getStoreData = () => {
        return new Promise((resolve, reject) => {
            user_db.get('SELECT user_id, access_token, contacto_tienda, direccion, whatsapp, saldo, metodo_pago FROM users WHERE user_id = ?', [req.query.store], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        store_data = {
                            user_id: row.user_id,
                            access_token: row.access_token,
                            contacto_tienda: row.contacto_tienda,
                            direccion: row.direccion,
                            whatsapp: row.whatsapp,
                            saldo: Number(row.saldo),
                            metodo_pago: row.metodo_pago
                        };
                        console.log(store_data);
                        resolve();
                    }
                    else {
                        console.log('No se encontró ninguna fila');
                        resolve();
                    }
                }
            });
        });
    };
    let pro = () => {
        return new Promise((resolve, reject) => {
            getStoreData().then(() => __awaiter(void 0, void 0, void 0, function* () {
                ids.forEach((e) => __awaiter(void 0, void 0, void 0, function* () {
                    fetch(`https://api.tiendanube.com/v1/${req.query.store}/orders/${e}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication': `bearer ${store_data.access_token}`,
                            'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)',
                        }
                    }).then(response => response.json()).then((data) => {
                        user_db.run('INSERT INTO pedidos (fecha_retiro, id_tienda, contacto_tienda, direccion_tienda, telefono_tienda, fecha_entrega, precio_envio, nombre_cliente, direccion_cliente, telefono_cliente, observaciones, metodo_pago) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [
                            new Date(mañana).toLocaleDateString(),
                            store_data.user_id,
                            store_data.contacto_tienda,
                            store_data.direccion,
                            store_data.whatsapp,
                            new Date(pasado_mañana).toLocaleDateString(),
                            data.shipping_cost_owner,
                            data.contact_name,
                            `${data.shipping_address.address} ${data.shipping_address.number}, ${data.shipping_address.floor} ${data.shipping_address.locality}`,
                            data.contact_phone,
                            data.customer.note,
                            store_data.metodo_pago
                        ], (error) => __awaiter(void 0, void 0, void 0, function* () {
                            if (error) {
                                console.error(error);
                            }
                            //hacer el informe de status de envío
                            let body1 = {
                                shipping_tracking_number: `${data.id}`,
                                shipping_tracking_url: "https://vmpk47rv-8000.brs.devtunnels.ms/seguimiento",
                                notify_customer: true
                            };
                            let body2 = JSON.stringify(body1);
                            yield fetch(`https://api.tiendanube.com/v1/${req.query.store}/orders/${e}/fulfill`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authentication': `bearer ${store_data.access_token}`,
                                    'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)',
                                },
                                body: body2
                            });
                            //res.sendFile('../../vistas/')
                        }));
                    });
                }));
                resolve();
            }));
        });
    };
    yield pro().then(() => {
        res.sendFile(path_1.default.join(__dirname, '../../vistas/confirmacion.html'));
    });
}));
routes.post("/costos", (req, res) => {
    let req_body = req.body;
    const tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
    const pasado_mañana2 = new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 3));
    function fecha(t) {
        const year = t.getFullYear();
        const month = String(t.getMonth() + 1).padStart(2, '0');
        const day = String(t.getDate()).padStart(2, '0');
        const hour = String(t.getHours()).padStart(2, '0');
        const minutes = String(t.getMinutes()).padStart(2, '0');
        const seconds = String(t.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hour}:${minutes}:${seconds}-0300`;
    }
    let volmaxmoto = 4000;
    let foundOrigin = false;
    let foundDestination = false;
    let costo_origen = 0;
    let cordon_origen;
    let cordon_destino;
    let zona_destino;
    let zona_origen;
    let costo_destino = 0;
    let cp_origen = req.body.origin.postal_code;
    let cp_destino = req.body.destination.postal_code;
    let items = req.body.items;
    let aux = 0;
    let vol_total = calc(items);
    function calc(items) {
        items.forEach((element) => {
            aux = aux + (element.dimensions.width * element.dimensions.height * element.dimensions.depth);
        });
        return aux;
    }
    console.log(vol_total);
    let price;
    const compare = () => {
        return new Promise((resolve, reject) => {
            fs_1.default.createReadStream(path_1.default.join(__dirname, 'cps.csv')).pipe((0, csv_parser_1.default)()).on('data', row => {
                if (Number(cp_origen) <= 1400 && Number(cp_origen) >= 1000 && foundOrigin == false) {
                    zona_origen = 'CABA';
                    cordon_origen = 'CABA';
                    vol_total > volmaxmoto ? costo_origen = 3300 : costo_origen = 3650;
                    foundOrigin = true;
                }
                if (Number(cp_destino) <= 1400 && Number(cp_destino) >= 1000 && foundDestination == false) {
                    zona_destino = 'CABA';
                    cordon_destino = 'CABA';
                    vol_total > volmaxmoto ? costo_destino = 3300 : costo_destino = 3650;
                    foundDestination = true;
                }
                if (cp_origen == row.cp && foundOrigin == false) {
                    zona_origen = row.zona;
                    cordon_origen = row.cordon;
                    vol_total > volmaxmoto ? costo_origen = row.auto : costo_origen = row.moto;
                    foundOrigin = true;
                }
                if (cp_destino == row.cp && foundDestination == false) {
                    zona_destino = row.zona;
                    cordon_destino = row.cordon;
                    vol_total > volmaxmoto ? costo_destino = row.auto : costo_destino = row.moto;
                    foundDestination = true;
                }
                if (foundDestination == true && foundOrigin == true) {
                    costo_destino >= costo_origen ? price = costo_destino : price = costo_origen;
                    if (zona_destino != 'CABA' && zona_origen != 'CABA' && zona_destino != zona_origen) {
                        cordon_origen == 'cordon 1' ? price = Number(price) + 500 : price;
                        cordon_origen == 'cordon 2' ? price = Number(price) + 1000 : price;
                        cordon_origen == 'cordon 3' ? price = Number(price) + 2500 : price;
                    }
                    resolve();
                    return false;
                }
            }).on('end', () => {
                if (!foundOrigin || !foundDestination) {
                    reject(new Error('Códigos postais no encontrados'));
                }
            });
        });
    };
    compare().then(() => {
        let obj = {
            rates: [
                {
                    name: "FLASH NOW ENVIOS Express",
                    code: "express",
                    price: Number(price),
                    price_merchant: Number(price),
                    currency: "ARS",
                    type: "ship",
                    min_delivery_date: fecha(tomorrow),
                    max_delivery_date: fecha(pasado_mañana2),
                    phone_required: true,
                    reference: "ref123"
                }
            ]
        };
        console.log(obj);
        res.json(obj);
    }).catch((error) => {
        console.error(error);
        res.statusMessage = 'No hay CPA encontrado';
        res.sendStatus(404);
    });
});
routes.get("/auth/install", auth_1.AuthenticationController.install);
routes.post("/products", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.create);
routes.get("/products/total", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.getTotal);
routes.get("/products", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.getAll);
routes.delete("/products/:id", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.delete);
exports.default = routes;
