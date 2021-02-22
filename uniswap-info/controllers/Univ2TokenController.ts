
import dayjs from 'dayjs';
import debug from 'debug';
const cache = require('memory-cache');

import { client, blockClient } from '../apollo-graphql/client';
import { get2DayPercentChange, getPercentChange, getBlockFromTimestamp, isAddress, getBlocksFromTimestamps, splitQuery, formattedNum } from '../utils';
import { ALL_TOKENS, TOKEN_DATA, FILTERED_TRANSACTIONS, TOKEN_CHART, TOKENS_CURRENT, TOKENS_DYNAMIC, PRICES_BY_BLOCK, PAIR_DATA } from '../apollo-graphql/queries';

const loggerInfo: debug.IDebugger = debug('app-univ2-api-token-controller');

export async function getTradeVolumeUSDOneDay(_address: string) : Promise<any> {
	const _cacheValue = cache.get('_TradeVolumeOneDay:' + _address.toLowerCase());
	if (_cacheValue) {
		return _cacheValue;
	}
	const utcCurrentTime = dayjs();
	const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
	const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
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
    cache.put('_TradeVolumeOneDay:' + _address.toLowerCase(), !!oneDayVolumeUSD ? oneDayVolumeUSD : oneDayVolumeUT, 1000 * 60); // 缓存1分钟
    return cache.get('_TradeVolumeOneDay:' + _address.toLowerCase());
}

export async function getTradeVolumeUSDOneDayBluk() : Promise<any[]> {
	const utcCurrentTime = dayjs();
	const utcOneDayBack = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
	const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
    const current: any =  await client.query({ query: TOKENS_CURRENT, fetchPolicy: 'no-cache', });
    // 根据时间戳, 查24小时内的一个区块编号
    let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);  
    // 根据时间戳, 查48小时内的一个区块编号
    let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack); 
    // 根据代币地址和24小时内的一个区块编号，查询该代币在24小时内的流动性
    let oneDayResult = await client.query({ query: TOKENS_DYNAMIC(oneDayBlock), fetchPolicy: 'no-cache' });
    // 根据代币地址和48小时内的一个区块编号，查询该代币在48小时内的所有数据
    let twoDayResult = await client.query({ query: TOKENS_DYNAMIC(twoDayBlock), fetchPolicy: 'no-cache' });
    let oneDayData: any = oneDayResult?.data?.tokens.reduce((obj: any, cur: any, i: number) => { return { ...obj, [cur.id]: cur } }, {});
    let twoDayData: any = twoDayResult?.data?.tokens.reduce((obj: any, cur: any, i: number) => { return { ...obj, [cur.id]: cur } }, {});
    let bulkResults = await Promise.all(
      	current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token: any) => {
			let data = token;
			let oneDayHistory = oneDayData?.[token.id];
			let twoDayHistory = twoDayData?.[token.id];
			// catch the case where token wasnt in top list in previous days
			if (!oneDayHistory) {
			let oneDayResult = await client.query({ query: TOKEN_DATA(token.id, oneDayBlock), fetchPolicy: 'no-cache', })
				oneDayHistory = oneDayResult.data.tokens[0];
			}
			if (!twoDayHistory) {
			let twoDayResult = await client.query({ query: TOKEN_DATA(token.id, twoDayBlock), fetchPolicy: 'no-cache', });
				twoDayHistory = twoDayResult.data.tokens[0];
			}
			const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange( data.tradeVolumeUSD, oneDayHistory?.tradeVolumeUSD ?? 0, twoDayHistory?.tradeVolumeUSD ?? 0 );
			const [oneDayTxns, txnChange] = get2DayPercentChange( data.txCount, oneDayHistory?.txCount ?? 0, twoDayHistory?.txCount ?? 0 );
          	data.oneDayVolumeUSD = oneDayVolumeUSD.toString();
			return data;
        })
    );
    return bulkResults;
}

export async function getAllTokens() : Promise<any[]> {
    let _allTokens : any[] = [];
	const TOKENS_TO_FETCH = 500
  	let allFound = false
    let skipCount = 0
    let tokens : any[] = []
    while (!allFound) {
		let result = await client.query({ query: ALL_TOKENS, variables: { skip: skipCount, }, fetchPolicy: 'no-cache', })
		tokens = tokens.concat(result?.data?.tokens)
		if (result?.data?.tokens?.length < TOKENS_TO_FETCH || tokens.length > TOKENS_TO_FETCH) {
			allFound = true
		}
		skipCount = skipCount += TOKENS_TO_FETCH
    }    
    _allTokens = tokens.map(m => ({ id: m.id, symbol: m.symbol }));
    return _allTokens
}


