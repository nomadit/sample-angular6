
import {mergeMap, map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { WalletService } from '../../../providers/wallet.service';
import { PoolService } from '../../../providers/pool.service';
import { MainCoinForETHClaymore } from '../../../shared/consts';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

class coinSummary {
  public balance = 0;
  public balanceKrw = 0;
  public payouts = 0;
  public payoutsKrw =  0;
  public exchangeRate = 0;
}

const NANOPOOL_API_URL = 'https://api.nanopool.org/v1/';
const ETHERMINE_API_URL = 'https://api.ethermine.org/miner/';
const UPBIT_EXCHANGE_API_URL = 'https://api.upbit.com/v1/';

// TODO - remove PayoutService in future
@Injectable()
export class BalanceService {
  public error = new Subject<string>();

  protected http: HttpClient;
  protected wallet: WalletService;
  protected pool: PoolService;

  private coinNExchangeRateMap: Map<string, number> = new Map();
  private ethermineBalanceDenominator = 1000000000000000000.0;


  constructor(injector: Injector) {
    this.http = injector.get(HttpClient);
    this.wallet = injector.get(WalletService);
    this.pool = injector.get(PoolService);
  }

  public getCoinSummationMap(userID: number) {
    return this.wallet.getListByUserID(userID).pipe(map((walletList: any[]) => {
      let poolIDNWalletAddressSetMap: Map<number, Set<string>> = new Map();
      for (const wallet of walletList) {
        // Allow only main coin, if necessary in future remove below lines
        if (!MainCoinForETHClaymore[wallet.coin]) {
          continue;
        }
        // end
        if (poolIDNWalletAddressSetMap.has(wallet.pool_id) === false) {
          poolIDNWalletAddressSetMap.set(wallet.pool_id, new Set());
        }
        poolIDNWalletAddressSetMap.get(wallet.pool_id).add(wallet.address);
      }
      return poolIDNWalletAddressSetMap
    }),mergeMap(poolIDNWalletAddressSetMap => {
      return this.pool.getListAll().pipe(map((poolList: any[]) => {
        let poolIDNPoolMap: Map<number, any> = new Map();
        for (const pool of poolList) {
          if (poolIDNPoolMap.has(pool.id) === false) {
            poolIDNPoolMap.set(pool.id, pool);
          }
        }
        return this.setCoinSummationMap(poolIDNPoolMap, poolIDNWalletAddressSetMap);
      }));
    }),);
  }

  private async setCoinSummationMap(poolIDNPoolMap: Map<number, any>, poolIDNWalletAddressSetMap: Map<number, Set<string>>) {
    let coinSummationMap: Map<string, any> = new Map();
    if (!poolIDNWalletAddressSetMap) {
      return;
    }
    poolIDNWalletAddressSetMap.forEach(async(walletAddressSet, poolID) => {
      const pool = poolIDNPoolMap.get(poolID);
      if (coinSummationMap.has(pool.coin) === false) {
        coinSummationMap.set(pool.coin, new coinSummary());
      }
      walletAddressSet.forEach(async(walletAddress) => {
        // calculate wallet balance
        const balanceMap = await this.getWalletBalance(pool, walletAddress);
        coinSummationMap.get(pool.coin).balance += balanceMap.balance;
        // TODO - calculate wallet payouts - remove in future
        const payoutsMap = await this.getWalletPayouts(pool, walletAddress);
        coinSummationMap.get(pool.coin).payouts += payoutsMap.payouts;
        // end payouts
        // reflect exchange rate on each coin
        const exchangeRate = await this.getCoinExchangeRate(pool.coin);
        coinSummationMap.get(pool.coin).exchangeRate = exchangeRate;
        coinSummationMap.get(pool.coin).balanceKrw = Math.round(coinSummationMap.get(pool.coin).balance * exchangeRate);
        coinSummationMap.get(pool.coin).payoutsKrw = Math.round(coinSummationMap.get(pool.coin).payouts * exchangeRate);
      });
    });
    return coinSummationMap;
  }

  private async getWalletBalance(pool: any, walletAddress: string) {
    let walletBalance = new coinSummary();
    try {
      const responseMap = await this.getWalletBalanceByPool(pool, walletAddress);
      if (responseMap && (responseMap.status === true || responseMap.status === 'OK')) {
        walletBalance.balance += parseFloat(this.extractWalletBalanceByPool(pool, responseMap));
      }
    } catch (err) {
      console.log('getWalletBalance - error ', err);
      this.error.next('getWalletBalance');
    }
    return walletBalance;
  }

  private getWalletBalanceByPool(pool: any, walletAddress: string) {
    switch(pool.name) {
      case 'nanopool':
      case 'pascal-nanopool':
        const coin = pool.coin === 'SC' ? 'SIA': pool.coin;
        return this.getNanopoolBalance(coin, walletAddress);
      case 'ethermine':
        return this.getEthermineBalance(walletAddress);
      // case 'bbaldaepool':
      //   return this.getBbaldaepoolBalance();
      default:
        console.error('getPoolBalance - Unregistered pool', pool.name);
        break;
    }
  }

  private extractWalletBalanceByPool(pool: any, responseMap: any) {
    if (responseMap.data === 'NO DATA') {
      return 0;
    }
    switch(pool.name) {
      case 'nanopool':
      case 'pascal-nanopool':
        return responseMap.data.balance;
      case 'ethermine':
        return responseMap.data.unpaid / this.ethermineBalanceDenominator;
      // case 'bbaldaepool':
      //   return responseMap.data.balance;
      default:
        console.error('extractConfirmedBalanceByPool - Unregistered pool', pool.name);
        break;
    }
  }

  private async getCoinExchangeRate(coin: string) {
    if (this.coinNExchangeRateMap.has(coin)) {
      return this.coinNExchangeRateMap.get(coin);
    }
    try {
      const map = await this.getUpbitExchangeRate(coin);
      this.coinNExchangeRateMap.set(coin, parseInt(map[0]['trade_price']));
      return this.coinNExchangeRateMap.get(coin);
    } catch (err) {
      console.log('getCoinExchangeRate - error', err);
    }
  }

  public async getWalletPayouts(pool: any, walletAddress: string) {
    let walletPayouts = {
      payouts: 0
    };
    try {
      const responseMap = await this.getWalletPayoutsByPool(pool, walletAddress);
      if (responseMap && (responseMap.status === true || responseMap.status === 'OK')) {
        for (const data of responseMap.data) {
          walletPayouts.payouts += parseFloat(this.extractWalletPayoutsByPool(pool, data));
        }
      }
    } catch (err) {
      console.log('getWalletPayouts - error ', err);
    }
    return walletPayouts;
  }

  private getWalletPayoutsByPool(pool: any, walletAddress: string) {
    switch(pool.name) {
      case 'nanopool':
      case 'pascal-nanopool':
        const coin = pool.coin === 'SC' ? 'SIA': pool.coin;
        return this.getNanopoolPayouts(coin, walletAddress);
      case 'ethermine':
        return this.getEtherminePayouts(walletAddress);
      // case 'bbaldaepool':
      //   return this.getBbaldaepoolBalance();
      default:
        console.error('getPoolBalance - Unregistered pool', pool.name);
        break;
    }
  }

  private extractWalletPayoutsByPool(pool: any, data: any) {
    if (data.data === 'NO DATA') {
      return 0;
    }
    switch(pool.name) {
      case 'nanopool':
      case 'pascal-nanopool':
        return data.amount;
      case 'ethermine':
        return data.amount / this.ethermineBalanceDenominator;
      // case 'bbaldaepool':
      //   return this.getBbaldaepoolBalance();
      default:
        console.error('extractUnConfirmedBalanceByPool - Unregistered pool', pool.name);
        break;
    }
  }

  private getNanopoolBalance(coin: string, walletAddress: string): Promise<any> {
    return this.http.get<any>(NANOPOOL_API_URL + coin.toLowerCase() + '/user/' + walletAddress).toPromise();
  }

  private getEthermineBalance(walletAddress: string): Promise<any> {
    return this.http.get<any>(ETHERMINE_API_URL + walletAddress + '/currentStats').toPromise();
  }

  private getUpbitExchangeRate(coin: string): Promise<any> {
    return this.http.get<any>(UPBIT_EXCHANGE_API_URL + 'ticker?markets=KRW-' +coin).toPromise();
  }

  private getNanopoolPayouts(coin: string, walletAddress: string): Promise<any> {
    return this.http.get<any>(NANOPOOL_API_URL + coin.toLowerCase() + '/payments/' + walletAddress).toPromise();
  }

  private getEtherminePayouts(walletAddress: string): Promise<any> {
    return this.http.get<any>(ETHERMINE_API_URL + walletAddress + '/payouts').toPromise();
  }
}
