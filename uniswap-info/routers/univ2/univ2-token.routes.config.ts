import { CommonRoutesConfig } from '../../common/common.routes.config';
import express from 'express';
import { expect } from 'chai';
import debug from 'debug';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import web3 from "web3";

import { client, blockClient } from '../../apollo-graphql/client';

import {
  get2DayPercentChange,
  getPercentChange,
  getBlockFromTimestamp,
  isAddress,
  getBlocksFromTimestamps,
  splitQuery,
  formattedNum
} from '../../utils';

import {
  TOKEN_DATA,
  FILTERED_TRANSACTIONS,
  TOKEN_CHART,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  PRICES_BY_BLOCK,
  PAIR_DATA,
} from '../../apollo-graphql/queries';

const loggerInfo: debug.IDebugger = debug('app-univ2-api-token');



dayjs.extend(utc);

// Uniswap Info
// ----------------------------------------
// https://github.com/Uniswap/uniswap-info
export class Univ2TokenRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Univ2TokenRoutes');
    }
    configureRoutes() {
        this.app.route(`/index`)
            .get((req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(200).json({ code: 200, message: 'OK', data: 'This is Index page.' });
            });
        // 查询某代币过去24小时的交易总量
        this.app.route(`/getTradeVolumeOneDay`)
            .get((req: express.Request, res: express.Response, next: express.NextFunction) => {
                const _address: string = req.query['tokenAddr'] as string; // 代币地址
                expect(web3.utils.isAddress(_address), 'tokenAddr not invalid').to.be.true;
                const utcCurrentTime = dayjs();
                const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
                const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
                (async () => {
                  try {
                    // 初始化变量
                    let data = { tradeVolumeUSD: Object, untrackedVolumeUSD: Object };
                    let oneDayData = { tradeVolumeUSD: Object, untrackedVolumeUSD: Object };
                    let twoDayData = { tradeVolumeUSD: Object, untrackedVolumeUSD: Object };
                    // 根据时间戳, 查24小时内的一个区块编号
                    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);  
                    // 根据时间戳, 查48小时内的一个区块编号
                    let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack); 
                    // 根据代币地址查该代币的全链流动性
                    let result = await client.query({ query: TOKEN_DATA(_address), fetchPolicy: 'no-cache' });
                    // 根据代币地址和24小时内的一个区块编号，查询该代币在24小时内的流动性
                    let oneDayResult = await client.query({ query: TOKEN_DATA(_address, oneDayBlock), fetchPolicy: 'no-cache' });
                    // 根据代币地址和48小时内的一个区块编号，查询该代币在48小时内的所有数据
                    let twoDayResult = await client.query({ query: TOKEN_DATA(_address, twoDayBlock), fetchPolicy: 'no-cache' });
                    // 如果查到了取每个结果的第0个数据, 就是该代币的流动性相关数据
                    data = result?.data?.tokens?.[0]; 
                    oneDayData = oneDayResult.data.tokens[0];
                    twoDayData = twoDayResult.data.tokens[0];
                    // 如果24小时内有数据就查询结果的第一条
                    if (!oneDayData) {
                      let oneDayResult = await client.query({ query: TOKEN_DATA(_address, oneDayBlock), fetchPolicy: 'no-cache', });
                      oneDayData = oneDayResult.data.tokens[0];
                    }
                    // 如果48小时内有数据就查询结果的第一条
                    if (!twoDayData) {
                      let twoDayResult = await client.query({ query: TOKEN_DATA(_address, twoDayBlock), fetchPolicy: 'no-cache', })
                      twoDayData = twoDayResult.data.tokens[0];
                    }
                    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange( data.tradeVolumeUSD, oneDayData?.tradeVolumeUSD ?? 0, twoDayData?.tradeVolumeUSD ?? 0 );
                    const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange( data.untrackedVolumeUSD, oneDayData?.untrackedVolumeUSD ?? 0, twoDayData?.untrackedVolumeUSD ?? 0 );
                    return res.status(200).json({ code: 200, message: 'OK',  data: { tradeVolumePassed24Hrs: !!oneDayVolumeUSD ? oneDayVolumeUSD : oneDayVolumeUT } });
                  } catch (err) {
                    next(err);
                  }
                })();
            });
        return this.app;
    }
}