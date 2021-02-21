import express from 'express';
import * as http from 'http';
import * as bodyparser from 'body-parser';
import cors from 'cors'
import debug from 'debug';
import morgan from 'morgan';
import moment from 'moment-timezone';

import { CommonRoutesConfig } from './common/common.routes.config';
import { Univ2TokenRoutes } from './routers/univ2/univ2-token.routes.config';

import { ErrorHandler } from './common/error';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port: number = 3101;
const routes: Array<CommonRoutesConfig> = [];
const loggerInfo: debug.IDebugger = debug('app');
const loggerError: debug.IDebugger = debug('app-error');

morgan.token('date', () => {
    return moment().tz('Asia/Shanghai').format();
});

morgan.format('myformat', '[:date] ":method :url" :status :res[content-length] - :response-time ms');

app.use(morgan('combined'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

routes.push(new Univ2TokenRoutes(app));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`)
});

// Handle 404
app.use((req, res, next) => {
    if(res.status(404)) {
        res.status(200).json({ code: 404, message: 'Not Found' });
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