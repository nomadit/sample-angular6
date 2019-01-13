
import {mergeMap, map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { PlugService } from '../app/providers/plug.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PcService } from '../../providers/pc.service';
import { UserService } from '../../providers/user.service';
import { AuthService } from '../../providers/auth.service';
import { FactoryService } from '../../providers/factory.service';
import { MinerService } from '../../providers/miner.service';
import { Observable } from 'rxjs';
import { MonitoringService } from '../service';
import { SecondCoinForETHClaymore } from '../../shared/consts';

@Injectable()
export class Service {
  protected monitoring: MonitoringService;
  protected pc: PcService;
  protected miner: MinerService;
  protected user: UserService;
  protected factory: FactoryService;
  protected auth: AuthService;
  protected http: HttpClient;

  constructor(injector: Injector) {
    this.monitoring = injector.get(MonitoringService);
    this.pc = injector.get(PcService);
    this.miner = injector.get(MinerService);
    this.user = injector.get(UserService);
    this.factory = injector.get(FactoryService);
    this.auth = injector.get(AuthService);
    this.http = injector.get(HttpClient);
  }

  public isAdmin() {
    return this.auth.getInfo().role === 'ADMIN';
  }

  public getPageByFactoryIDsNLoginIDWithStatus(pageNum: number, perPage: number, factoryIDs: any[], query: any) {
    if (pageNum < 1) {
      console.error('currentPage is less than 0');
      return;
    }
    if (perPage < 1) {
      console.error('pageRowCount is less than 0');
      return;
    }
    let params = new HttpParams();
    for (let id of factoryIDs) {
      params = params.append('factoryID', id.toString());
    }
    params = params.append('loginID', query.loginID);
    params = params.append('status', query.status);
    params = params.append('pageNum', pageNum.toString());
    params = params.append('perPage', perPage.toString());
    return this.http.get(process.env.API_URL + '/api/pc/page', {params});
  }

  public getSummary(factoryIDs, query: any) {
    if (factoryIDs.length < 1) {
      console.error('factoryIDs length is less than 0');
      return;
    }
    let params = new HttpParams();
    for (let id of factoryIDs) {
      params = params.append('factoryID', id.toString().trim());
    }
    params = params.append('loginID', query.loginID.trim());
    return this.http.get(process.env.API_URL + '/api/pc/summary', {params});
  }

  public getThresholdMapByPCIDs(pcs: any[]) {
    const ids = [];
    for (const pc of pcs) {
      ids.push(pc.id)
    }
    return this.pc.getThresholdMapByPCIDs(ids).pipe(map((list) => {
      let thresholdMap: Map<number, any> = new Map();
      for (let item of list) {
        if (item.gpuJson.length === 0) {
          continue;
        }
        let gpuObj = JSON.parse(item.gpuJson);
        let thresholdGpuMap: Map<number, number> = new Map();
        for (let idx of Object.keys(gpuObj)) {
          thresholdGpuMap.set(parseInt(idx), gpuObj[idx]);
        }
        thresholdMap.set(item.pcId, {
          gpuNum: item.gpuNum,
          gpuMap: thresholdGpuMap,
        });
      }
      return thresholdMap;
    }));
  }

  public getRebootCountMapByPcs(pcs: any[]) {
    const ids = [];
    for (const pc of pcs) {
      ids.push(pc.id)
    }
    return this.pc.getRebootCountMapByIDs(ids).pipe(map((map) => {
      let rebootMap: Map<number, number> = new Map();
      for (const item of Object.keys(map)) {
        rebootMap.set(parseInt(item), map[item])
      }
      return rebootMap;
    }));
  }

  public getFactoryListForFactory(): Observable<any[]> {
    // https://yakovfain.com/2017/09/07/rxjs-essentials-part-5-the-flatmap-operator/
    return this.auth.getInfoForMonitoring().pipe(mergeMap(info => {
      return this.user.listFactoryByUserId(info.id).pipe(mergeMap(list => {
        let idSet: Set<number> = new Set();
        for (let item of list) {
          idSet.add(item.factory_id);
        }
        if (idSet.size > 0) {
          return this.getFactoryListByIDs(idSet);
        } else {
          return [];
        }
      }));
    }));
  }

  public getFactoryListByIDs(idSet: Set<number>): Observable<any[]> {
    return this.factory.getListByIDs(idSet);
  }

  public getErrorCountMapByPcMinerMap(pcIdNMinersMap: Map<number, any[]>) {
    const ids = [];
    pcIdNMinersMap.forEach(value => {
      for (const miner of value) {
        ids.push(miner.id)
      }
    });
    return this.miner.getErrorCountMapByIDs(ids).pipe(map((map) => {
      let pcIDErrorCntMap = new Map<number, number>();
      pcIdNMinersMap.forEach((value, key) => {
        if (!pcIDErrorCntMap.has(key)) {
          pcIDErrorCntMap.set(key, 0);
        }
        let sum = pcIDErrorCntMap.get(key);
        for (const miner of value) {
          if (map[miner.id]) {
            sum += map[miner.id];
          }
        }
        pcIDErrorCntMap.set(key, sum);
      });
      return pcIDErrorCntMap;
    }));
  }

  public getRestartCountMapByPcMinerMap(pcIdNMinersMap: Map<number, any[]>) {
    const ids = [];
    pcIdNMinersMap.forEach(value => {
      for (const miner of value) {
        ids.push(miner.id)
      }
    });
    return this.miner.getRestartCountMapByIDs(ids).pipe(map((map: any) => {
      let pcIDRestartCntMap = new Map<number, number>();
      pcIdNMinersMap.forEach((value, key) => {
        if (!pcIDRestartCntMap.has(key)) {
          pcIDRestartCntMap.set(key, 0);
        }
        let sum = pcIDRestartCntMap.get(key);
        for (const miner of value) {
          if (map[miner.id]) {
            sum += map[miner.id];
          }
        }
        pcIDRestartCntMap.set(key, sum);
      });
      return pcIDRestartCntMap;
    }));
  }

  public reboots(ids: number[]) {
    return this.pc.reboots(ids);
  }

  public removeList(ids:number[]) {
    return this.pc.deletes(ids);
  }

  public removeLog(ids:number[]) {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id.toString());
    }
    return this.http.delete<any>(process.env.API_URL + '/api/pc/stat/by_ids', {params});
  }

  public getMinersMapByPcs(pcs: any[]) {
    return this.monitoring.getMinersMapByPcs(pcs)
  }

  public getMinerIDNStatMapForDualByPcIDNMinersMap(pcIDNMinersMap: Map<number, any[]>) {
    const ids = [];
    pcIDNMinersMap.forEach(value => {
      for (const miner of value) {
        ids.push(miner.id);
      }
    });
    return this.miner.getStatMap(ids).pipe(map(
      (map) => {
        let statMap: Map<number, any[]> = new Map();
        let gpuStatMap: Map<number, Map<number, any[]>> = new Map();
        for (const k of ids) {
          let gpuList = (<any> map)[k];
          if (gpuList) {
            gpuList.sort((x, y) => {
              return x.gpu_index < y.gpu_index ? 0 : 1;
            });
          } else {
            gpuList = [];
          }
          const gpuMap = new Map<number, any[]>();
          for(const stat of gpuList) {
            if (!gpuMap.has(stat.gpu_index)) {
              gpuMap.set(stat.gpu_index, [stat]);
            } else {
              const content = JSON.parse(stat.content);
              if (content.coin in SecondCoinForETHClaymore) {
                gpuMap.get(stat.gpu_index).push(stat);
              } else {
                gpuMap.get(stat.gpu_index).unshift(stat);
              }
            }
          }
          statMap.set(k, gpuList);
          gpuStatMap.set(k, gpuMap);
        }
        return {
          statMap: statMap,
          gpuStatMap: gpuStatMap
        }
      }
    ));
  }

  public getPcGpuStatusMap(pcList: any[]): Observable<Map<number, any>> {
    let params = new HttpParams();
    for (let pc of pcList) {
      params = params.append('id', pc.id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/pc/map/gpu/status/by_pc_ids', {params}).pipe(map((res: any) => {
      const map = new Map<number, Map<number, any>>();
      Object.keys(res).forEach(key => {
        const gpuStatusMap = new Map<number, any>();
        for(const status of res[key]) {
          gpuStatusMap.set(status.gpu_index, status);
        }
        map.set(parseInt(key), gpuStatusMap);
      });
      return map;
    }));
  }

  public getMinerErrorListForFactory(factoryIDs: any[], resolve: (list: any[]) => any) {
    this.miner.errorListForFactory(factoryIDs).subscribe((list) => {
      resolve(list);
    });
  }

  public getIotPlugMap(pcList: any[]): Observable<Map<number, any>> {
    let params = new HttpParams();
    for (let pc of pcList) {
      params = params.append('id', pc.id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/plug/map/by_pc_ids', {params}).pipe(map((res: any) => {
      const map = new Map<number, any>();
      Object.keys(res).forEach(key => {
        map.set(parseInt(key), res[key]);
      });
      return map;
    }));
  }
}
