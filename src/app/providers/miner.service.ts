import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class MinerService {
  constructor(private http: HttpClient, private auth: AuthService) {
  }

  public terminatePairUserIDMinerIDList(list: any[]): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/miner/list/terminate/pair', list);
  }

  public errorListForFactory(factoryIDs: any[]): Observable<any[]> {
    let params = new HttpParams();
    for (let id of factoryIDs) {
      params = params.append('id', id);
    }
    return this.http.get<any[]>(process.env.API_URL + '/api/miner/error/list/by_factory_ids', { params });
  }

  public errorListByUserID(userID: number): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/miner/error/list/by_user_id/' + userID);
  }

  public listByPcIDs(pcIDs: any[]): Observable<any[]> {
    let params = new HttpParams();
    for (let pcId of pcIDs) {
      params = params.append('id', pcId.toString());
    }
    return this.http.get<any[]>(process.env.API_URL + '/api/miner/list/by_pc_ids', {params});
  }

  public pageByUserIDs(userIDs: any[], currentPage: number, pageRowCount: number): Observable<any> {
    let params = new HttpParams();
    for (let id of userIDs) {
      params = params.append('userID', id.toString());
    }
    params = params.append('pageNum', currentPage.toString());
    params = params.append('perPage', pageRowCount.toString());
    return this.http.get(process.env.API_URL + '/api/miner/page', {params});
  }

  public getStatMap(ids: any[]): Observable<Map<number, any[]>> {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id);
    }
    return this.http.get<Map<number, any[]>>(process.env.API_URL + '/api/miner/map/stat/by_miner_ids', {params});
  }

  public listByUserIDs(userIDs: number[]): Observable<any[]> {
    let params = new HttpParams();
    for (let id of userIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get<any[]>(process.env.API_URL + '/api/miner/list/by_user_ids', {params});
  }

  public changeWallet(form:any): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/miner/wallet', JSON.stringify(form));
  }

  public changeOwner(userID: number, walletID: number, minerIDs: any[]): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/miner/owner/by_miner_ids', JSON.stringify({
      beforeUserID: +this.auth.getInfo().id,
      afterUserID: +userID,
      walletID,
      minerIDs,
    }));
  }

  public countMapByWholesale(userID: number): Observable<any> {
    return this.http.get(process.env.API_URL + '/api/miner/map/count/wholesale/by_user_id/' + userID);
  }

  public getCountMapByWholesaleIDs(wholesaleIDs: number[]): Observable<any> {
    let params = new HttpParams();
    for (let wholesaleID of wholesaleIDs) {
      params = params.append('id', wholesaleID.toString());
    }
    return this.http.get(process.env.API_URL + '/api/miner/map/count/wholesale/by_user_ids', {params});
  }

  public getRestartCountMapByIDs(minerIDs: number[]): Observable<any> {
    let params = new HttpParams();
    for (let miner of minerIDs) {
      params = params.append('id', miner.toString());
    }
    return this.http.get(process.env.API_URL + '/api/miner/map/restart/count/by_ids', {params});
  }

  public getErrorCountMapByIDs(minerIDs: number[]): Observable<any> {
    let params = new HttpParams();
    for (let miner of minerIDs) {
      params = params.append('id', miner.toString());
    }
    return this.http.get(process.env.API_URL + '/api/miner/map/error/log/count/by_ids', {params});
  }

  public getErrorLogListByID(minerID: number): Observable<any> {
    return this.http.get(process.env.API_URL + '/api/miner/list/error/log/' + minerID);
  }

  public getCommandListByMinerIDs(minerIDs: number[]): Observable<any[]> {
    let params = new HttpParams();
    for (let miner of minerIDs) {
      params = params.append('id', miner.toString());
    }
    return this.http.get<any[]>(process.env.API_URL + '/api/miner_command/list/by_miner_ids', {params});
  }

  public start(minerIDs: number[]): Observable<any> {
    return this.changeStatus(minerIDs, 'START');
  }

  public stop(minerIDs: number[]): Observable<any> {
    return this.changeStatus(minerIDs, 'STOP');
  }

  // public restart(minerIDs: number[]): Observable<any> {
  //   return this.changeStatus(minerIDs, 'RESTART');
  // }

  private changeStatus(ids, status) {
    return this.http.put(process.env.API_URL + '/api/miner/status/by_ids', JSON.stringify({ids: ids, status: status}));
  }
}
