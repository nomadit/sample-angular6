import { Injectable, Injector } from '@angular/core';
import { PlugService } from '../providers/plug.service';
import { PcService } from '../providers/pc.service';
import { MinerService } from '../providers/miner.service';
import { AuthService } from '../providers/auth.service';
import { FactoryService } from '../providers/factory.service';
import { UserService } from '../providers/user.service';
import { WalletService } from '../providers/wallet.service';
import { HttpClient } from '@angular/common/http';

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
}
