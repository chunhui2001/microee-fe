import express from 'express';
import * as http from 'http';
import * as bodyparser from 'body-parser';
import cors from 'cors'
import debug from 'debug';
import morgan from 'morgan';
import moment from 'moment-timezone';
const helmet = require("helmet");

import { CommonRoutesConfig } from './common/common.routes.config';
import { UniV2SDKRoutes } from './routers/univ2/univ2-sdk.routes.config';
import { UniV2TradeRoutes } from './routers/univ2/univ2-trade.routes.config';
import { UniV2TokenRoutes } from './routers/univ2/univ2-token.routes.config';
import { UniV2USDCRoutes } from './routers/univ2/univ2-usdc.routes.config';
import { Univ2SwapParamsRoutes } from './routers/univ2/univ2-swap-params.routes.config';

import { ErrorHandler } from './common/error';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port: number = 3101;
const routes: Array<CommonRoutesConfig> = [];
const loggerInfo: debug.IDebugger = debug('app');
const loggerError: debug.IDebugger = debug('app-error');
const favicon = Buffer.from('AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREQAAAAAAEAAAEAAAAAEAAAABAAAAEAAAAAAQAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD8HwAA++8AAPf3AADv+wAA7/sAAP//AAD//wAA+98AAP//AAD//wAA//8AAP//AAD//wAA', 'base64');


function skipLog (req: express.Request, res: express.Response) {
    var url = req.url;
    if(url.indexOf('?')>0)
        url = url.substr(0,url.indexOf('?'));
    if(url.match(/(js|jpg|png|ico|css|woff|woff2|eot|ico)$/ig)) {
        return true;
    }
    return false;
}

morgan.token('date', () => moment().tz('Asia/Shanghai').format()).format('myformat', '[:date] ":method :url" :status :res[content-length] - :response-time/ms');
app.use(morgan('myformat', { skip: skipLog }));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

routes.push(new UniV2SDKRoutes(app));
routes.push(new UniV2TradeRoutes(app));
routes.push(new UniV2TokenRoutes(app));
routes.push(new UniV2USDCRoutes(app));
routes.push(new Univ2SwapParamsRoutes(app));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`)
});

// Handle 404
app.use((req, res, next) => {
    if(res.status(404)) {
        res.status(404).json({ code: 404, message: 'Not Found' });
    }
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    ErrorHandler.handle(500, err, res);
});

process.on('unhandledRejection', (err: Error) => {
    loggerError(`unhandledRejection: errorName=${err.name}, errorMessage=${err.message}, stack=${err.stack}`);
});

server.listen(port, () => {
    loggerInfo(`Server running at http://localhost:${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        loggerInfo(`Routes configured for ${route.getName()}`);
    });
});