
import {mergeMap} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { MinerService } from '../../../providers/miner.service';
import { AuthService } from '../../../providers/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class Service {
  protected miner: MinerService;
  protected auth: AuthService;

  constructor(injector: Injector) {
    this.miner = injector.get(MinerService);
    this.auth = injector.get(AuthService);
  }

  public getUserInfo(): Observable<any> {
    return this.auth.getInfoForMonitoring();
  }

  public getPage(pageNum: number, perPage: number): Observable<any> {
    return this.getUserInfo().pipe(mergeMap(info => {
      return this.miner.pageByUserIDs([info.id], pageNum, perPage);
    }))
  }
}
