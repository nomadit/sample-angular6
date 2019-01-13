
import {map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { PlugService } from '../providers/plug.service';
import { PcService } from '../providers/pc.service';
import { MinerService } from '../providers/miner.service';
import { AuthService } from '../providers/auth.service';
import { FactoryService } from '../providers/factory.service';
import { UserService } from '../providers/user.service';
import { WalletService } from '../providers/wallet.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type MinerStat = {
  statList: any[],
  sumOfMinerPower: string,
  listOfMinerPower: string,
};

@Injectable()
export class MonitoringService {
  protected pc: PcService;
  protected miner: MinerService;
  protected user: UserService;
  protected factory: FactoryService;
  protected plug: PlugService;
  protected auth: AuthService;
  protected wallet: WalletService;
  protected http: HttpClient;

  constructor(injector: Injector) {
    this.pc = injector.get(PcService);
    this.miner = injector.get(MinerService);
    this.user = injector.get(UserService);
    this.factory = injector.get(FactoryService);
    this.plug = injector.get(PlugService);
    this.auth = injector.get(AuthService);
    this.wallet = injector.get(WalletService);
    this.http = injector.get(HttpClient);
  }

  public getMinersMapByPcs(pcList: any[]): Observable<Map<number, any[]>> {
    const ids = [];
    for (const pc of pcList) {
      ids.push(pc.id)
    }
    return this.miner.listByPcIDs(ids).pipe(map(res => {
      const map = new Map<number, any[]>();
      for (const miner of res) {
        if (map.has(miner.pc_id)) {
          map.get(miner.pc_id).push(miner);
        } else {
          map.set(miner.pc_id, [miner]);
        }
      }
      return map;
    }));
  }
}
