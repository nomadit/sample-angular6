
import {of as observableOf,  Observable } from 'rxjs';

import {mergeMap, map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { MinerService } from '../../../providers/miner.service';
import { AuthService } from '../../../providers/auth.service';
import { UserService } from '../../../providers/user.service';

@Injectable()
export class Service {
  protected miner: MinerService;
  protected user: UserService;
  protected auth: AuthService;

  constructor(injector: Injector) {
    this.miner = injector.get(MinerService);
    this.user = injector.get(UserService);
    this.auth = injector.get(AuthService);
  }

  public getUserInfo(): Observable<any> {
    return this.auth.getInfoForMonitoring();
  }

  public getCurrentUserRole() {
    return this.auth.getInfo().role;
  }

  public getRetailList(id: number) {
    return this.user.mapRetailListByWholesaleIDs([id]).pipe(map((map) => {
      if (map === null) {
        return [];
      } else {
        return map[id];
      }
    }));
  }

  public getCountMapByWholesale(): Observable<any> {
    return this.getUserInfo().pipe(mergeMap(info => {
      return this.miner.countMapByWholesale(info.id);
    }));
  }

  public getPage(pageNum: number, perPage: number, query: any): Observable<any> {
    switch (query.type) {
      case 'all':
        return this.miner.pageByUserIDs(query.allIDs, pageNum, perPage);
      case 'self':
        return this.getUserInfo().pipe(mergeMap(info => {
          return this.miner.pageByUserIDs([info.id], pageNum, perPage);
        }));
      case 'retail':
        return this.miner.pageByUserIDs([query.retailID], pageNum, perPage);
      case 'error':
        return this.getUserInfo().pipe(mergeMap(info => {
          return this.miner.errorListByUserID(info.id);
        }));
    }
    return observableOf()
  }

  public isAdmin() {
    return this.auth.getInfo().role === 'ADMIN';
  }
}
