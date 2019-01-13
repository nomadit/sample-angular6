
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class PcService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  public reboots(ids: number[]): Observable<any> {
    let params = new HttpParams();
    ids.forEach((id) => {
      params = params.append('id', id.toString());
    });
    return this.http.put<any>(process.env.API_URL + '/api/pc/reboot/by_ids', {}, {params});
  }

  public deletes(ids: number[]): Observable<any> {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id.toString());
    }
    return this.http.delete<any>(process.env.API_URL + '/api/pc/list/by_ids', {params});
  }

  public mapByIDs(ids: Set<number>): Observable<Map<number, any>> {
    let params = new HttpParams();
    ids.forEach((id) => {
      params = params.append('id', id.toString());
    });
    return this.http.get<Map<number, any>>(process.env.API_URL + '/api/pc/map/by_ids', {params});
  }

  public listSystemHis(id: number): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/pc/list/history/system/' + id);
  }

  public listByFactoryIDs(ids: number[]): Observable<any[]> {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id.toString());
    }
    return this.http.get<any[]>(process.env.API_URL + '/api/pc/list/by_factory_ids', {params});
  }

  public coinMapByIDs(pcIDs: number[]): Observable<any> {
    let params = new HttpParams();
    for (let id of pcIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/pc/coin/map/by_pc_ids', {params});
  }

  public listByIDs(ids: number[]): Observable<any> {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/pc/list/by_ids', {params});
  }

  public changeFactory(factoryID: number, pcIDList: number[]): Observable<any> {
    let params = new HttpParams();
    for (let id of pcIDList) {
      params = params.append('pcID', id.toString());
    }
    return this.http.put(process.env.API_URL + '/api/pc/factory/' + factoryID, {}, { params });
  }

  public getRebootCountMapByIDs(pcIDs: any[]): Observable<any> {
    let params = new HttpParams();
    for (let id of pcIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/pc/map/reboot/count/by_pc_ids', {params});
  }

  public getPcCntMapByUserIDs(userIDs: number[]): Observable<Map<number,number>> {
    let params = new HttpParams();
    for (let id of userIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/pc/map/count/by_user_ids', {params}).pipe(map((map) => {
      let pcCountMap = new Map<number, number>();
      for (const k of Object.keys(map)) {
        pcCountMap.set(parseInt(k, 10), map[k]);
      }
      return pcCountMap;
    })) as Observable<Map<number, number>>;
  }

  public getThresholdMapByPCIDs(pcIDs: any[]): Observable<any[]> {
    let params = new HttpParams();
    for (let id of pcIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get<any[]>(process.env.JAVA_API_URL + '/api/pc/hash/by_pc_ids', {params});
  }
}
