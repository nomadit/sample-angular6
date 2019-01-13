
import {map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PcService } from '../../../providers/pc.service';
import { MinerService } from '../../../providers/miner.service';
import { FactoryService } from '../../../providers/factory.service';
import { AuthService } from '../../../providers/auth.service';
import { MinerCommandService } from '../../../providers/miner-command.service';

@Injectable()
export class Service {
  protected pc: PcService;
  protected miner: MinerService;
  protected factory: FactoryService;
  protected auth: AuthService;
  protected http: HttpClient;
  protected minerCommand: MinerCommandService;

  constructor(injector: Injector) {
    this.pc = injector.get(PcService);
    this.miner = injector.get(MinerService);
    this.factory = injector.get(FactoryService);
    this.auth = injector.get(AuthService);
    this.http = injector.get(HttpClient);
    this.minerCommand = injector.get(MinerCommandService);
  }

  public getUserInfo() {
    return this.auth.getInfoForMonitoring();
  }

  public getFactoryMapByIDs(idSet: Set<number>) {
    return this.factory.getListByIDs(idSet).pipe(map(
      (list) => {
        const map = new Map<number, any>();
        for(const factory of list) {
          map.set(factory.id, factory);
        }
        return map;
      },
    ));
  }

  public getPcMap(ids: Set<number>) {
    return this.pc.mapByIDs(ids).pipe(map(map => {
      const pcMap = new Map<number, any>();
      ids.forEach(value => {
        pcMap.set(value, map[value]);
      });
      return pcMap;
    }));
  }

  public getMinerIDNStatMapForDual(ids: number[]) {
    return this.miner.getStatMap(ids).pipe(map(
      (map) => {
        let statMap: Map<number, any[]> = new Map();
        for (const k of ids) {
          let gpuList = (<any> map)[k];
          if (gpuList) {
            gpuList.sort((x, y) => {
              return x.gpu_index < y.gpu_index ? 0 : 1;
            });
          } else {
            gpuList = [];
          }
          statMap.set(k, gpuList)
        }
        return statMap;
      }
    ));
  }

  public getMinerCommandMap(ids: number[]) {
    return this.minerCommand.getMinerIDCommandMapByMinerIDs(ids)
  }
}
