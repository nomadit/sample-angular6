
import {map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { MinerService } from '../../../providers/miner.service';
import { UtilService } from '../../../providers/util.service';
import { PcService } from '../../../providers/pc.service';
import { PoolService } from '../../../providers/pool.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../providers/user.service';

@Injectable()
export class FactoryPcModalService {
  protected minerService: MinerService;
  protected pcService: PcService;
  protected poolService: PoolService;
  protected userService: UserService;
  protected utilService: UtilService;
  protected http: HttpClient;

  constructor(injector: Injector) {
    this.minerService = injector.get(MinerService);
    this.pcService = injector.get(PcService);
    this.poolService = injector.get(PoolService);
    this.userService = injector.get(UserService);
    this.utilService = injector.get(UtilService);
    this.http = injector.get(HttpClient);
  }

  public getStatMap(ids: number[]) {
    return this.minerService.getStatMap(ids).pipe(map(
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

  public startMiner(minerList:any[]) {
    const ids = [];
    for(const miner of minerList) {
      ids.push(miner.id)
    }
    return this.minerService.start(ids);
  }

  public stopMiner(minerList:any[]) {
    const ids = [];
    for(const miner of minerList) {
      ids.push(miner.id)
    }
    return this.minerService.stop(ids)
  }

  public getTotalCoin(list) {
    return this.utilService.getTotalCoinSum(list);
  }

  public getErrorLogListByMinerID(minerID: number, resolve: (list: any[]) => any) {
    this.minerService.getErrorLogListByID(minerID).subscribe((list) => {
      resolve(list);
    });
  }

  public getPcList(pcIDList: number[]) {
    return this.pcService.listByIDs(pcIDList)
  }

  public getPcCoinList(pcIDList: number[]) {
    return this.pcService.coinMapByIDs(pcIDList)
  }

  public getPoolList() {
    return this.poolService.getListAll()
  }

  public assignCoin(pcIDs: number[], coinList: string[]) {
    return this.http.put(process.env.API_URL + '/api/pc/coin', JSON.stringify({
      pcIDs: pcIDs,
      coins: coinList
    }));
  }

  public getUser(id: number) {
    return this.userService.getItemByID(id);
  }
}
