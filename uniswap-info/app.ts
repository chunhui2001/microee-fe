import express from 'express';
import * as http from 'http';
import * as bodyparser from 'body-parser';
import cors from 'cors'
import debug from 'debug';
import morgan from 'morgan';
import moment from 'moment-timezone';
const schedule = require('node-schedule');
const helmet = require("helmet");
const cache = require('memory-cache');
const favicon = require('serve-favicon');
const path = require('path');

import { CommonRoutesConfig } from './common/common.routes.config';
import { Univ2TokenRoutes } from './routers/univ2/univ2-token.routes.config';

import { ErrorHandler } from './common/error';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port: number = 3101;
const routes: Array<CommonRoutesConfig> = [];
const loggerInfo: debug.IDebugger = debug('app');
const loggerError: debug.IDebugger = debug('app-error');

import { getTradeVolumeUSDOneDayBluk } from './controllers/Univ2TokenController';

function skipLog (req: express.Request, res: express.Response) {
    var url = req.url;
    if(url.indexOf('?')>0)
        url = url.substr(0,url.indexOf('?'));
    if(url.match(/(js|jpg|png|ico|css|woff|woff2|eot)$/ig)) {
        return true;
    }
    return false;
}

morgan.token('date', () => moment().tz('Asia/Shanghai').format()).format('myformat', '[:date] ":method :url" :status :res[content-length] - :response-time/ms');

app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))
app.use(morgan('myformat', { skip: skipLog }));
app.use(helmet());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

routes.push(new Univ2TokenRoutes(app));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`)
});

app.get("/favicon.ico", function(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Length', favicon.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    res.end(favicon);
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
    // # ┌────────────── second (optional)
    // # │ ┌──────────── minute
    // # │ │ ┌────────── hour
    // # │ │ │ ┌──────── day of month
    // # │ │ │ │ ┌────── month
    // # │ │ │ │ │ ┌──── day of week
    // # │ │ │ │ │ │
    // # │ │ │ │ │ │
    // # * * * * * *
    const job1 = schedule.scheduleJob('*/30 * * * * *', function() { 
        ( async () => {
            let _allTokens : any[] = await getTradeVolumeUSDOneDayBluk();
            cache.put('_ALL_TOKENS_DATA', JSON.stringify(_allTokens), 1000 * 30); // 30s
            cache.put('_ALL_TOKENS_DATA_1MIN', JSON.stringify(_allTokens), 1000 * 60); // 1min
            cache.put('_ALL_TOKENS_DATA_2MIN', JSON.stringify(_allTokens), 1000 * 120); // 2min
            cache.put('_ALL_TOKENS_DATA_5MIN', JSON.stringify(_allTokens), 1000 * 60 * 5); // 5min
            cache.put('_ALL_TOKENS_DATA_10MIN', JSON.stringify(_allTokens), 1000 * 60 * 10); // 10min
            cache.put('_ALL_TOKENS_DATA_15MIN', JSON.stringify(_allTokens), 1000 * 60 * 15); // 15min
            cache.put('_ALL_TOKENS_DATA_30MIN', JSON.stringify(_allTokens), 1000 * 60 * 30); // 30min
            cache.put('_ALL_TOKENS_DATA_45MIN', JSON.stringify(_allTokens), 1000 * 60 * 45); // 45min
            cache.put('_ALL_TOKENS_DATA_60MIN', JSON.stringify(_allTokens), 1000 * 60 * 60); // 60min
        })();
    });
});