"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// @ts-ignore
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
/*const options = {
  key: fs.readFileSync(path.join(__dirname, 'localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.crt'))
};*/
dotenv_1.default.config({
    path: path_1.default.resolve(".env"),
});
const pug = require('pug');
const _config_1 = require("./config");
const _middlewares_1 = require("./middlewares");
require("./utils/passaport-strategy");
const port = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.set('view engine', pug);
app.set('views', path_1.default.join(__dirname, '../vistas'));
app.use((0, morgan_1.default)(":method :url :status :res[content-length] - :response-time ms"));
app.use((0, cors_1.default)());
app.use(_middlewares_1.beforeCheckClientMiddleware);
app.use(_config_1.AppRoutes);
app.use(_middlewares_1.errorHandlingMiddleware);
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
