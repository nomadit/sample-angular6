
import {map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { MinerService } from '../../../../../providers/miner.service';
import { MonitoringService } from '../../../../service';
import { PcService } from '../../../../../providers/pc.service';

@Injectable()
export class Service {
  protected miner: MinerService;
  protected mService: MonitoringService;

  constructor(injector: Injector,
              private pcService: PcService) {
    this.miner = injector.get(MinerService);
    this.mService = injector.get(MonitoringService)
  }

  public getStatMap(ids: number[]) {
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
}
