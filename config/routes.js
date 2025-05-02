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
const { time, error } = require("console");
const { READONLY } = require("sqlite3");
const dotenv_1 = __importDefault(require("dotenv"))
const sqlite3_1 = __importDefault(require("sqlite3"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const admin_vista = path_1.default.resolve(__dirname, '../vistas/admin.pug')
dotenv_1.default.config({
    path: path_1.default.resolve(".env"),
});
let saldo = 0;
let valores = [];
let date = new Date();
let mañana = date.setDate(date.getDate() + 1);
let pasado_mañana = date.setDate(date.getDate() + 2);
let data;
let row;
let db_admins_path = path_1.default.join(__dirname, './admins.db')
const admins_db = new sqlite3_1.default.Database(db_admins_path, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error en la conexión:', err);
    }
    else {
        console.log('Conexión a la base de datos establecida');
    }
})
let db_precios = path_1.default.join(__dirname, '../features/auth/precios.db');
let db_path = path_1.default.join(__dirname, '../features/auth/users.db');
let pedidos_hook = 'https://app-tienda-nube.onrender.com/envios_hook';
const user_db = new sqlite3_1.default.Database(db_path, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error en la conexión:', err);
    }
    else {
        console.log('Conexión a la base de datos establecida');
    }
});
const routes = (0, express_1.Router)();

routes.post("/alta_admin", (req, res) =>{
    let contra = process.env.ADMIN
    let body = req.body
    if(contra != req.body.contrasena){
        res.sendStatus(403)
        res.end('PROHIBIDO, contraseña invalida')
    }else{
        sqlite3_1.default.serialize(() => {
            admins_db.run('CREATE TABLE IF NOT EXISTS admins (admin TEXT NOT NULL, contrasena TEXT NOT NULL)', (err) =>{
                if(err){
                    console.error(err)
                }
            })
            admins_db.run('INSERT INTO admins VALUES (?,?)', [body.usuario, body.contrasena], (err)=>{
                if(err){
                    console.error(err)
                }
            })
        })
        
    }
})

routes.get("/admin", (req, res) =>{
    admins_db.get('SELECT admin from admins', (err, row) =>{
        if(row.admin){
            res.render(admin_vista, {
                usuario: row.admin,
                contrasena: row.contrasena
            })
        }
    })
})

function enviarDatos(obj) {
    console.log('OBJETO A ENVIAR ', obj);
    return new Promise((resolve, reject) => {
        fetch('https://script.google.com/macros/s/AKfycbx5Pzo55p3_AQ2Qu-Q-rFYuSZ7Yd9Ac5gWSsSW_VaUnzZt1BNMwh-58Gje-S1_y3UGU/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        .then(response => {
            if (!response.ok) {
                console.log(`----------------------------------Error: ${response.status} ${response.statusText}`);
                reject(new Error(`Error: ${response.status} ${response.statusText}`));
            } else {
                return response.json();
            }
        })
        .then(data => {
            console.log('---------------------------------------Respuesta recibida:', data);
            resolve(data);
        })
        .catch(error => {
            console.error('--------------------------------------Error al enviar datos:', error);
            reject(error);
        });
    });
}

routes.post('/user_load', (req, res) => {
    let usuario = req.body.usuario
    let contrasena = req.body.contrasena
    console.log(` datos de ingreso a usuarios ${usuario}, ${contrasena}`)

    user_db.get('SELECT user_id, access_token, email, cp_tienda, contacto_tienda, direccion, whatsapp, saldo, metodo_pago FROM users WHERE usuario = ?  &  contrasena = ? ', [usuario, contrasena], (err, row) => {
        if(!err){
            let obj = {
                usuario,
                contrasena,
                user_id: row.user_id,
                contacto_tienda: row.contacto_tienda,
                activo: row.activo,
                direccion: row.direccion,
                whatsapp: row.whatsapp,
                metodo_pago: row.metodo_pago,
                email: row.email,
                cp_tienda: row.cp_tinda
            }
            res.render(path_1.default.join(__dirname, '../vistas/registro.pug'), obj)
        }else if(err){
            console.error(err)
            res.statusCode = 500
            res.statusMessage = 'Algo salio mal'
        }
    })
})

routes.post("/buscar", (req, res) => {
    user_db.get('SELECT where')
    
    res.json(response)
})

routes.get("/user", (req, res) =>{
    res.render(path_1.default.join(__dirname, '../vistas/user.pug'))
})

routes.get("/", (req, res) =>{
    res.render(path_1.default.join(__dirname, '../vistas/usuario.pug'))
})

function modificar_saldo(costo, user_id){
    user_db.get('SELECT saldo from users where user_id = ?', [user_id], (err, row) => {
        if(!err && row){
            console.log(`saldo previo en el row: ${row}`)
            let saldo = row.saldo
            let nuevo_saldo = Number(saldo) + Number(costo)
            user_db.run('UPDATE users set saldo = ? where user_id = ?', [nuevo_saldo, user_id], (error) =>{
                if(error){
                    console.error(error)
                }
            })
            console.log(` nuevo saldo ${nuevo_saldo}`)
        }else if(err || !row){
            console.error(err)
        }
    })    
}

routes.post("/registro", (req, res) => {
    console.log(req.body);
    let usuario = req.body.usuario || "na";
    let contrasena = req.body.contrasena || "na";
    let direccion = req.body.direccion || "na";
    let contacto_tienda = req.body.contacto_tienda || "na";
    let user_id = req.body.id || "na";
    let cp_tienda = req.body.cp_tienda || "na";
    let metodo_pago = req.body.metodo_pago || "na";
    let email = req.body.email || "na";
    let telefono = req.body.telefono || "na";
    let whatsapp = req.body.whatsapp || "na";
    user_db.run('UPDATE users set direccion = ?, usuario = ?, contrasena = ?, cp_tienda = ?, metodo_pago = ?, contacto_tienda = ?, email = ?, whatsapp = ?, phone = ? WHERE user_id = ?', [direccion, usuario, contrasena, cp_tienda, metodo_pago, contacto_tienda, email, whatsapp, telefono, user_id], (err) => {
        if (err) {
            console.error(err);
        }
        else {
            res.render(path_1.default.join(__dirname, '../vistas/usuario.pug'))
        }
    });
});

routes.post('/envios_hook', (req, res) => {
    let id_pedido = req.body;
    console.log(`NUEVO ENVIO DESDE EL HOOK`);
    console.log(id_pedido);
    res.statusCode = 200;
    res.end('proceso con exito');
});


//ruta para posteo de estados de envios e todo tipo
routes.post('/estates', async (req, res) => {
    //envios es un array {envios: [{id, estado, obs}]}
    let body = await req.body
    console.log(`REQQQQQ: ${JSON.stringify(body)}`)
        body.envios.forEach(envio => {
                user_db.get(`select * from ESTADOS where id_envio = ?`, [envio.id], (err, row) => {
                    if(err){
                        res.status(401).send('error')
                    }else if(row){
                        user_db.run(`
                            UPDATE ESTADOS set estado = ?, observaciones = ? where id_envio = ?`, [envio.estado, envio.obs, envio.id])
                        }else if(!row){
                        user_db.run(`
                            INSERT INTO ESTADOS (id_envio, estado, observaciones) VALUES (
                            ?,?,?)`, [envio.id, envio.estado, envio.obs])
                    }
                })
        })
        return res.status(201).send('actualizado')
})


routes.get('/estates', async (req, res) => {
    //busqueda por query_params
    let {id} = req.query
    console.log(id)
    await user_db.get('SELECT * FROM  ESTADOS WHERE id_envio = ?', [id], (err, row) => {
        if(err) {
            console.log(err)
            return res.status(404).send('Lo sentimos no hay registros para ese código')
        }else if(row){
            return res.status(200).json({id: row.id_envio,estado: row.estado,obs: row.observaciones})
        }
        else if(!row){
            return res.status(404).send('No encontrado')
        }
    })
})





/*
routes.get('/modif', (req, res) => {
    let code = req.query.code
    if(code == process.env.ADMIN){
        user_db.serialize(() => {
            //user_db.run('UPDATE users set saldo = 0')
            user_db.run('delete from pedidos')
            user_db.run('delete from carrier')
            user_db.run('drop table users')
            //user_db.run('delete from users')
            //user_db.run('drop table pedidos')
            /*user_db.run(`CREATE TABLE IF NOT EXISTS pedidos (
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
    }else{
        res.end('Código inválido')
    }
    
});

*/
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
routes.get("/seguimiento", (req, res) => {
let estado = req.query.estado
let numero = req.query.numero
user_db.run('UPDATE pedidos set seguimiento = ? where observaciones = ?', [estado, numero], (err) =>{
    if(err){
        console.error(err)
    }
})})
/*routes.post('/seguimiento', async (req, res) =>{
let numero = req.body.numero
await user_db.get('SELECT seguimiento where observaciones = ?',[numero], (err, row) =>{
    if(!err){
        res.status(200).send({
            estado: row.seguimiento
        })
    }else{
        res.status(404).send({
            estado: 'Número no encontrado'
        })
    }
})})*/
routes.post('/seguimiento', async (req, res) => {
    let numero = req.body.numero;

    try {
        const row = await new Promise((resolve, reject) => {
            user_db.get('SELECT seguimiento FROM pedidos WHERE observaciones = ?', [numero], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (row) {
            res.status(200).send({
                estado: row.seguimiento
            });
        } else {
            res.status(404).send({
                estado: 'Número no encontrado'
            });
        }
    } catch (error) {
        res.status(500).send({
            estado: 'Error en la consulta'
        });
    }
});

routes.get("/estado_envio", (req, res) =>{
    res.sendFile(path_1.default.join(__dirname, './estados.html'))
})
//ruta para usuarios dentro de tienda nube
routes.get("/descarga-db", (req, res) => {
    if(req.query.code == process.env.ADMIN){
        
        fs_1.default.access(db_path, fs_1.default.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('Base de datos no encontrada');
            }
    
            
            res.download(db_path, 'copia_usuarios.sqlite', (err) => {
                if (err) {
                    console.error('Error al descargar la base de datos:', err);
                    res.status(500).send('Error al descargar la base de datos');
                }
            });
        })

    }
});

routes.get("/reservas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let ids = req.query.id;
    console.log('LOS IDS SON::::::::::::::::', ids)
    if(typeof(ids) === "string"){
        ids = [ids]
    }
    let store_data;
    //obtenemos la data de la tienda
    const getStoreData = () => {
        return new Promise((resolve, reject) => {
            user_db.get('SELECT user_id, access_token, email, contacto_tienda, direccion, whatsapp, saldo, metodo_pago FROM users WHERE user_id = ?', [req.query.store], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        store_data = {
                            user_id: row.user_id,
                            access_token: row.access_token,
                            email: row.email,
                            contacto_tienda: row.contacto_tienda,
                            direccion: row.direccion,
                            whatsapp: row.whatsapp,
                            saldo: Number(row.saldo),
                            metodo_pago: row.metodo_pago
                        };
                        console.log(store_data);
                        resolve(store_data);
                    }
                    else {
                        console.log('No se encontró ninguna fila');
                        resolve();
                    }
                }
            });
        });
    };

    //busca los datos de cada uno de los pedidos
    /*
    let pro = () => {
        return new Promise((resolve, reject) => {
            const ids_enviados = []
            getStoreData().then(() => __awaiter(void 0, void 0, void 0, function* () {
                ids.forEach((e) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log('HACIENDO PETICION DE DATOS DE TIENDA A TIENDA NUVE')
                    console.log( 'A LA URL :', `https://api.tiendanube.com/v1/${req.query.store}/orders/${e}`)
                    fetch(`https://api.tiendanube.com/v1/${req.query.store}/orders/${e}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication': `bearer ${store_data.access_token}`,
                            'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)',
                        }
                    }).then(response => response.json()).then((data) => {
                        console.log('------------------------------------------ NUEVO PEDIDO ENVIANDOSE A RESERVAS -----------------------------------------')
                        //console.log('++++++++++++++++++++++++++++ data del nuevo pedido', data)
                        ids_enviados.push(e)
                        user_db.run(`CREATE TABLE IF NOT EXISTS pedidos (
                            fecha_retiro DATE,
                            id_tienda TEXT,
                            contacto_tienda TEXT,
                            direccion_tienda TEXT,
                            telefono_tienda TEXT,
                            fecha_entrega DATE,
                            precio_envio TEXT,
                            nombre_cliente TEXT,
                            direccion_cliente TEXT,
                            telefono_cliente TEXT,
                            observaciones TEXT,
                            metodo_pago TEXT
                            )`)
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
                            e,
                            store_data.metodo_pago
                        ], (error) => __awaiter(void 0, void 0, void 0, function* () {
                            if (error) {
                                console.error(error);
                            }
                            
                            //hacer la cargua a flash
                            let envio_flash = {
                                id_envio: e,
                                mail: store_data.email,
                                fecha_retiro: new Date(mañana).toLocaleDateString(),
                                id_tienda: store_data.user_id,
                                contacto_tienda: store_data.contacto_tienda,
                                direccion_tienda: store_data.direccion,
                                telefono_tienda: store_data.whatsapp,
                                fecha_entrega: new Date(pasado_mañana).toLocaleDateString(),
                                precio_envio: data.shipping_cost_owner,
                                nombre_cliente: data.contact_name,
                                direccion_cliente: `${data.shipping_address.address} ${data.shipping_address.number}, ${data.shipping_address.floor} ${data.shipping_address.city}`,
                                telefono_clinete: data.contact_phone,
                                metodo_pago: store_data.metodo_pago,
                                mail_cliente: data.contact_email
                            }

                            modificar_saldo(envio_flash.precio_envio, store_data.user_id)
                            
                            enviarDatos(envio_flash)
                            
                            console.log(data)
                            //hacer el informe de status de envío
                            let body1 = {
                                shipping_tracking_number: `${data.id}`,
                                shipping_tracking_url: "https://app-tienda-nube.onrender.com/estado_envio",
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
                console.log('-----------------------------------ids_enviados', ids_enviados)
                resolve();
            }));
        });
    };*/

    const pro = async () => {
        return new Promise(async (resolve, reject) => {
            const ids_enviados = [];

            try {

                let store_data = await getStoreData();
                console.log(' ---------------------------------------------------- store_data', store_data)
                
                for (const e of ids) {
                    console.log('HACIENDO PETICION DE DATOS DE TIENDA A TIENDA NUVE');
                    console.log('A LA URL :', `https://api.tiendanube.com/v1/${req.query.store}/orders/${e}`);
    
                    const response = await fetch(`https://api.tiendanube.com/v1/${req.query.store}/orders/${e}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication': `bearer ${store_data.access_token}`,
                            'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)',
                        }
                    });
    
                    const data = await response.json();
                    if(data.shipping_address){
                        console.log('DATOS DEL SHIPPING ADDRESS:', data.shipping_address)
                    }
                    if(!data.shipping_address){
                        data.shipping_address = {
                            address: 'No hay datos',
                            number: 'No hay datos',
                            floor: 'No hay datos',
                            locality: 'No hay datos'
                        }
                       console.log('No hay datos del shipping address')
                    }
                    console.log('------------------------------------------ NUEVO PEDIDO ENVIANDOSE A RESERVAS -----------------------------------------');
                    ids_enviados.push(e);
    
                    user_db.run(`CREATE TABLE IF NOT EXISTS pedidos (
                        fecha_retiro DATE,
                        id_tienda TEXT,
                        contacto_tienda TEXT,
                        direccion_tienda TEXT,
                        telefono_tienda TEXT,
                        fecha_entrega DATE,
                        precio_envio TEXT,
                        nombre_cliente TEXT,
                        direccion_cliente TEXT,
                        telefono_cliente TEXT,
                        observaciones TEXT,
                        metodo_pago TEXT
                    )`);
    
                    user_db.run(
                        'INSERT INTO pedidos (fecha_retiro, id_tienda, contacto_tienda, direccion_tienda, telefono_tienda, fecha_entrega, precio_envio, nombre_cliente, direccion_cliente, telefono_cliente, observaciones, metodo_pago) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                        [
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
                            e,
                            store_data.metodo_pago
                        ],
                        async (error) => {
                            if (error) {
                                console.error(error);
                                return;
                            }
    
                            // Hacer la carga a Flash
                            const envio_flash = {
                                id_envio: e,
                                mail: store_data.email,
                                fecha_retiro: new Date(mañana).toLocaleDateString(),
                                id_tienda: store_data.user_id,
                                contacto_tienda: store_data.contacto_tienda,
                                direccion_tienda: store_data.direccion,
                                telefono_tienda: store_data.whatsapp,
                                fecha_entrega: new Date(pasado_mañana).toLocaleDateString(),
                                precio_envio: data.shipping_cost_owner,
                                nombre_cliente: data.contact_name,
                                direccion_cliente: `${data.shipping_address.address} ${data.shipping_address.number}, ${data.shipping_address.floor} ${data.shipping_address.city}`,
                                telefono_clinete: data.contact_phone,
                                metodo_pago: store_data.metodo_pago,
                                mail_cliente: data.contact_email
                            };
    
                            modificar_saldo(envio_flash.precio_envio, store_data.user_id);
    
                            enviarDatos(envio_flash);
    
                            console.log(data);
    
                            // Hacer el informe de status de envío
                            const body1 = {
                                shipping_tracking_number: `${data.id}`,
                                shipping_tracking_url: "https://app-tienda-nube.onrender.com/estado_envio",
                                notify_customer: true
                            };
    
                            const body2 = JSON.stringify(body1);
    
                            await fetch(`https://api.tiendanube.com/v1/${req.query.store}/orders/${e}/fulfill`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authentication': `bearer ${store_data.access_token}`,
                                    'User-Agent': 'Flash Now Entrepreneurs (emm.matiasacevedosiciliano@gmail.com)',
                                },
                                body: body2
                            });
                        }
                    );
                }
    
                console.log('-----------------------------------ids_enviados', ids_enviados);
                resolve();
            } catch (error) {
                console.error('Error en la función pro:', error);
                reject(error);
            }
        });
    };

pro().then(() => {
        //console.log(`+++++++++++++++++++++++++++++++++++++++++++++++++++++++ ${items1}`)
        res.render(path_1.default.join(__dirname,'../vistas/confirmacion.pug'),{
            tab_title: "Ordenes agendedadas",
            title: "Tus envíos fueron agregados"
        })
        //res.sendFile(path_1.default.join(__dirname, '../../vistas/confirmacion.html'));
    });
}));

function buscar_origen(id) {
    return new Promise((resolve, reject) => {
        user_db.get('SELECT cp_tienda FROM users WHERE user_id = ?', [id], (err, row) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            if (!row || row.cp_tienda == 'na' || row.cp_tienda == 'no definido') {
                return resolve(null); // Devuelve null si no hay datos
            }
            resolve(Number(row.cp_tienda)); // Devuelve el código postal
        });
    });
}

routes.post("/costos_web", async (req, res) => {

    let req_body = req.body
    console.log('COSTO WEB PARA: ', req.body)
    let vol_total = req_body.volumen ? req_body.volumen : 3999
    let total_paq = req_body.paquetes ? req_body.paquetes : 1
    let price = 0
    let medidas
    let volmaxmoto = 3999;
    let foundOrigin = false;
    let foundDestination = false;
    let costo_origen = 0;
    let cordon_origen;
    let cordon_destino;
    let zona_destino;
    let zona_origen;
    let costo_destino = 0;
    let cp_origen = Number(req_body.origen)
    let cp_destino = Number(req_body.destino)
    /*
    const compare1 = () => {
        return new Promise((resolve, reject) => {
            fs_1.default.createReadStream(path_1.default.join(__dirname, 'cps.csv')).pipe((0, csv_parser_1.default)()).on('data', row => {
                if(cp_origen == 1400 && foundOrigin == false){
                    cordon_origen = "CABA"
                    zona_origen = "CABA"
                    if(vol_total > volmaxmoto){
                        costo_destino = 4600
                    }
                    if(vol_total <= volmaxmoto){
                        costo_destino = 4100
                    }
                    foundOrigin = true
                }
                if(cp_destino == 1400 && foundDestination == false){
                    cordon_destino = "CABA"
                    zona_destino = "CABA"
                    if(vol_total > volmaxmoto){
                        costo_destino = 4600
                    }
                    if(vol_total <= volmaxmoto){
                        costo_destino = 4100
                    }
                    foundDestination = true
                }
                if(row.cp == cp_origen && foundOrigin == false){
                    cordon_origen = row.cordon
                    zona_origen = row.zona
                    if(vol_total > volmaxmoto){
                        costo_destino = row.auto
                    }
                    if(vol_total <= volmaxmoto){
                        costo_destino = row.moto
                    }
                    foundOrigin = true
                }
                if(row.cp == cp_destino && foundDestination == false){
                    cordon_destino = row.cordon
                    zona_destino = row.zona
                    if(vol_total > volmaxmoto){
                        costo_destino = row.auto
                    }
                    if(vol_total <= volmaxmoto){
                        costo_destino = row.moto
                    }
                    foundDestination = true
                }
                //calculos de extras * zonas para no caba
                if(cordon_origen != "CABA" && cordon_destino != "CABA"){
                    if(zona_origen == "zonanorte" && cordon_origen == "cordon 1" && zona_destino != zona_origen){
                        costo_origen = costo_origen + 1000
                        costo_destino = costo_destino + 1000
                    }
                    else if(zona_origen == "zonanorte" && cordon_origen == "cordon 2" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2" || cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                    }
                    else if(zona_origen == "zonanorte" && cordon_origen == "cordon 3" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2"){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                        else if(cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 4000
                            costo_destino = costo_destino + 4000
                        }
                    }
                    else if(zona_origen == "zonaoeste" && cordon_origen == "cordon 1" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                    }
                    else if(zona_origen == "zonaoeste" && cordon_origen == "cordon 2" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2" || cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                    }
                    else if(zona_origen == "zonaoeste" && cordon_origen == "cordon 3" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2"){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                        else if(cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 4000
                            costo_destino = costo_destino + 4000
                        }
                    }
                    else if(zona_origen == "zonasur" && cordon_origen == "cordon 1" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                    }
                    else if(zona_origen == "zonasur" && cordon_origen == "cordon 2" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2" || cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                    }
                    else if(zona_origen == "zonasur" && cordon_origen == "cordon 1" && zona_destino != zona_origen){
                        if(cordon_destino == "cordon 1"){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(cordon_destino == "cordon 2"){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                        else if(cordon_destino == "cordon 3"){
                            costo_origen = costo_origen + 3000
                            costo_destino = costo_destino + 3000
                        }
                    }
                }
                //calculos de extras * paquetes
                //eliminamos el paquete más grande (hasta el límite grande)
                if(req_body.paquete.length > 1){
                    medidas = req_body.paquete.map(subArray => subArray.reduce((acc, val) => acc * val, 1)).sort((x, y) => y - x)
                    if(Number(medidas[0]) - 64000 <= 0){
                        medidas.shift()
                    }
                    else{
                        medidas[0] = medidas[0] - 64000
                    }
                    medidas.forEach(e => {
                        if(e <= 20*20*10){
                            costo_origen = costo_origen + 1000
                            costo_destino = costo_destino + 1000
                        }
                        else if(e <= 40*40*40){
                            costo_origen = costo_origen + 2000
                            costo_destino = costo_destino + 2000
                        }
                        else if(e <= 50*50*40){
                            costo_origen = costo_origen + 3000
                            costo_destino = costo_destino + 3000
                        }
                        else if(e > 50*50*40){
                            costo_origen = "Demasiado grande, contactese con nosotros directamente"
                            costo_destino = "Demasiado grande, contactese con nosotros directamente"
                        }
                    })
                }
            }).on('end', () => {
                if (!foundOrigin || !foundDestination) {
                    reject('Códigos postales no encontrados');
                }
                else {
                    resolve()
                }
            })            
        })
    }*/

        const compare1 = () => {
            return new Promise((resolve, reject) => {
              let extraZonaAplicado = false;
              let extraMedidasAplicado = false;
          
              fs_1.default.createReadStream(path_1.default.join(__dirname, 'cps.csv'))
                .pipe((0, csv_parser_1.default)())
                .on('data', row => {
                  if (cp_origen == 1400 && foundOrigin == false) {
                    cordon_origen = "CABA";
                    zona_origen = "CABA";
                    if (vol_total > volmaxmoto) {
                      costo_destino = 4600;
                    }
                    if (vol_total <= volmaxmoto) {
                      costo_destino = 4100;
                    }
                    foundOrigin = true;
                  }
                  
                  if (cp_destino == 1400 && foundDestination == false) {
                    cordon_destino = "CABA";
                    zona_destino = "CABA";
                    if (vol_total > volmaxmoto) {
                      costo_destino = 4600;
                    }
                    if (vol_total <= volmaxmoto) {
                      costo_destino = 4100;
                    }
                    foundDestination = true;
                  }
                  
                  if (row.cp == cp_origen && foundOrigin == false) {
                    cordon_origen = row.cordon;
                    zona_origen = row.zona;
                    if (vol_total > volmaxmoto) {
                      costo_destino = Number(row.auto);
                    }
                    if (vol_total <= volmaxmoto) {
                      costo_destino = Number(row.moto);
                    }
                    foundOrigin = true;
                  }
                  
                  if (row.cp == cp_destino && foundDestination == false) {
                    cordon_destino = row.cordon;
                    zona_destino = row.zona;
                    if (vol_total > volmaxmoto) {
                      costo_destino = Number(row.auto);
                    }
                    if (vol_total <= volmaxmoto) {
                      costo_destino = Number(row.moto);
                    }
                    foundDestination = true;
                  }
          
                  // Cálculos de extras * zonas para no CABA (solo una vez)
                  if (!extraZonaAplicado && cordon_origen != "CABA" && cordon_destino != "CABA") {
                    if (zona_origen == "zonanorte" && cordon_origen == "cordon 1" && zona_destino != zona_origen) {
                      costo_origen += 1000;
                      costo_destino += 1000;
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonanorte" && cordon_origen == "cordon 2" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2" || cordon_destino == "cordon 3") {
                        costo_origen += 2000;
                        costo_destino += 2000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonanorte" && cordon_origen == "cordon 3" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2") {
                        costo_origen += 2000;
                        costo_destino += 2000;
                      } else if (cordon_destino == "cordon 3") {
                        costo_origen += 4000;
                        costo_destino += 4000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonaoeste" && cordon_origen == "cordon 1" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 3") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonaoeste" && cordon_origen == "cordon 2" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2" || cordon_destino == "cordon 3") {
                        costo_origen += 2000;
                        costo_destino += 2000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonaoeste" && cordon_origen == "cordon 3" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2") {
                        costo_origen += 2000;
                        costo_destino += 2000;
                      } else if (cordon_destino == "cordon 3") {
                        costo_origen += 4000;
                        costo_destino += 4000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonasur" && cordon_origen == "cordon 1" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 3") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonasur" && cordon_origen == "cordon 2" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2" || cordon_destino == "cordon 3") {
                        costo_origen += 2000;
                        costo_destino += 2000;
                      }
                      extraZonaAplicado = true;
                    }
                    else if (zona_origen == "zonasur" && cordon_origen == "cordon 1" && zona_destino != zona_origen) {
                      if (cordon_destino == "cordon 1") {
                        costo_origen += 1000;
                        costo_destino += 1000;
                      } else if (cordon_destino == "cordon 2") {
                        costo_origen += 2000;
                        costo_destino += 2000;
                      } else if (cordon_destino == "cordon 3") {
                        costo_origen += 3000;
                        costo_destino += 3000;
                      }
                      extraZonaAplicado = true;
                    }
                  }
                })
                .on('end', () => {
                  if (!foundOrigin || !foundDestination) {
                    reject('Códigos postales no encontrados');
                  } else {
                    // Cálculos de extras * paquetes (solo una vez)
                    if (!extraMedidasAplicado && req_body.paquete.length > 1) {
                      medidas = req_body.paquete.map(subArray => subArray.reduce((acc, val) => acc * val, 1))
                        .sort((x, y) => y - x);
                      
                      if (Number(medidas[0]) - 64000 <= 0) {
                        medidas.shift();
                      } else {
                        medidas[0] = medidas[0] - 64000;
                      }
          
                      // Aplicar el extra de medidas solo una vez según el paquete más grande restante
                      if (medidas.length > 0) {
                        const medidaMasGrande = medidas[0];
                        if (medidaMasGrande <= 202010) {
                          costo_origen += 1000;
                          costo_destino += 1000;
                        } else if (medidaMasGrande <= 404040) {
                          costo_origen += 2000;
                          costo_destino += 2000;
                        } else if (medidaMasGrande <= 505040) {
                          costo_origen += 3000;
                          costo_destino += 3000;
                        } else if (medidaMasGrande > 505040) {
                          costo_origen = "Demasiado grande, contactese con nosotros directamente";
                          costo_destino = "Demasiado grande, contactese con nosotros directamente";
                        }
                        extraMedidasAplicado = true;
                      }
                    }
                    resolve();
                  }
                });
            });
          };

    compare1().then(() => {
        return res.json({
            message: "pop",
            calculo: costo_destino >= costo_origen ? costo_destino : costo_origen 
        })}).catch((error) => {
        console.log(error);
        res.statusMessage = 'No hay CPA encontrado';
        res.sendStatus(404);
    })

})

routes.post("/costos",  async (req, res) => {

    console.log('NUEVO PEDIDO')
    
    let req_body = req.body;
        const tomorrow = new Date(new Date().getTime());
        const pasado_mañana2 = new Date(new Date().getTime() + ((24 * 60 * 60 * 1000) * 5));
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
        let cp_origen = req.body.origin.postal_code
        if((cp_origen == '1741' || cp_origen == Number('1741'))){
            cp_origen = 1140
        }
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
        console.log(` volumen de pedido ${vol_total}`);
        let price;
        const compare = () => {
            return new Promise((resolve, reject) => {
                console.log(`el cp de origen es ${req.body.origin.postal_code} el de destino es ${req.body.destination.postal_code}`)
                fs_1.default.createReadStream(path_1.default.join(__dirname, 'cps.csv')).pipe((0, csv_parser_1.default)()).on('data', row => {
                    if (Number(cp_origen) <= 1499 && Number(cp_origen) >= 1000 && foundOrigin == false) {
                        zona_origen = 'CABA';
                        cordon_origen = 'CABA';
                        vol_total < volmaxmoto ? costo_origen = 4100 : costo_origen = 4600;
                        foundOrigin = true;
                    }
                    if (Number(cp_destino) <= 1499 && Number(cp_destino) >= 1000 && foundDestination == false) {
                        zona_destino = 'CABA';
                        cordon_destino = 'CABA';
                        vol_total < volmaxmoto ? costo_destino = 4100 : costo_destino = 4600;
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
                        reject('Códigos postales no encontrados');
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
            console.log(error);
            res.statusMessage = 'No hay CPA encontrado';
            res.sendStatus(404);
        });
})

routes.get("/auth/install", auth_1.AuthenticationController.install);
routes.post("/products", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.create);
routes.get("/products/total", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.getTotal);
routes.get("/products", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.getAll);
routes.delete("/products/:id", passport_1.default.authenticate("jwt", { session: false }), product_1.ProductController.delete);
exports.default = routes;
