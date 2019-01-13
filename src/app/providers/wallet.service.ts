
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class WalletService {
  constructor(private http: HttpClient, private auth: AuthService) {
  }


  public getListByUserID(userID: number): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/wallet/list/by_user_id/' + userID);
  }

  public getMapByMinerIDs(minerIDs: number[]): Observable<any[]> {
    let params = new HttpParams();
    for (let id of minerIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get<any[]>(process.env.API_URL + '/api/wallet/map/by_miner_ids', {params});
  }

  public getMinerCountMapByIDs(walletIDs: number[]): Observable<Map<number, number>> {
    let params = new HttpParams();
    for (let id of walletIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get<any>(process.env.API_URL + '/api/wallet/map/miner/count/by_ids', {params}).pipe(map((map) => {
      let walletIDNMinerCntMap: Map<number, number> = new Map();
      for (let key of Object.keys(map)) {
        walletIDNMinerCntMap.set(parseInt(key, 10), map[key]);
      }
      return walletIDNMinerCntMap;
    })) as Observable<Map<number, number>>;
  }

  public createWallet(walletInfo: any): Observable<any> {
    return this.http.post(process.env.API_URL + '/api/wallet', JSON.stringify(walletInfo));
  }

  public changeWallet(walletInfo: any): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/wallet/' + walletInfo.id, JSON.stringify(walletInfo));
  }

  public deleteWalletListByIDs(userID:number, walletIDs: number[]): Observable<any> {
    let params = new HttpParams();
    for (let walletID of walletIDs) {
      params = params.append('id', walletID.toString());
    }
    return this.http.delete(process.env.API_URL + '/api/wallet/list/'+ userID + '/by_ids', {params});
  }

  // deprecated TODO refactoring target
  // public listByUser(): Observable<any[]> {
  //   return this.http.get<any[]>(process.env.API_URL + '/api/wallet/list/by_user/' + this.auth.getInfo().id);
  // }
  //
  // public register(userInfo: any): Observable<any> {
  //   return this.http.post(process.env.API_URL + '/api/wallet/register/by_user/' + this.auth.getInfo().id,
  //     JSON.stringify(userInfo));
  // }
  //
  // public deleteWallet(userInfo: any): Observable<any> {
  //   return this.http.post(process.env.API_URL + '/api/wallet/delete/by_user/' + this.auth.getInfo().id,
  //
  // }
  //
  // public updateWallet(userInfo: any): Observable<any> {
  //   return this.http.post(process.env.API_URL + '/api/wallet/update/by_user/' + this.auth.getInfo().id,
  //     JSON.stringify(userInfo));
  // }
  //
  // public getListByMinerIDs(minerIDs: number[]): Observable<any[]> {
  //   let params = new HttpParams();
  //   for (let id of minerIDs) {
  //     params = params.append('id', id.toString());
  //   }
  //   return this.http.get<any[]>(process.env.API_URL + '/api/wallet/list/by_miner_ids', {params});
  // }
}
