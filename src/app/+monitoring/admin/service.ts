
import {of} from 'rxjs';

import {mergeMap, map} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { PlugService } from '../app/providers/plug.service';
import { HttpClient } from '@angular/common/http';
import { MinerService } from '../../providers/miner.service';
import { FactoryService } from '../../providers/factory.service';
import { MinerErrorStatus } from '../const';

class summary {
  public id: number = 0;
  public name = '';
  public login_id = '';
  public allCount = 0;
  public normalCount = 0;
  public errorPerformCount = 0;
  public errorTempCount = 0;
  public stopCount = 0;
}


@Injectable()
export class Service {
  protected miner: MinerService;
  protected factory: FactoryService;
  protected http: HttpClient;

  private factoryMap: Map<number, any>;
  private factoryHasUsersMap: Map<number, number[]>;
  private userMap: Map<number, any>;
  private wholesaleUsersMap: Map<number, number[]>;

  constructor(injector: Injector) {
    this.miner = injector.get(MinerService);
    this.factory = injector.get(FactoryService);
    this.http = injector.get(HttpClient);
    this.factoryHasUsersMap = new Map();
  }

  public getFactorySummaryList() {
    return this.getList().pipe(map((list: any[]) => {
      const map = new Map<number, any[]>();
      for (const item of list) {
        if (map.has(item.factory_id)) {
          map.get(item.factory_id).push(item)
        } else {
          map.set(item.factory_id, [item]);
        }
      }
      const summaryMap = new Map<number, summary>();
      map.forEach((value, key) => {
        summaryMap.set(key, this.makeSummary(value, new summary()));
      });
      return summaryMap;
    }), mergeMap((fMap: Map<number, summary>) => {
      return this.getFactoryMap().pipe(map(factoryMap => {
        factoryMap.forEach((value, key) => {
          if (fMap.has(key)) {
            value.allCount = fMap.get(key).allCount;
            value.errorPerformCount = fMap.get(key).errorPerformCount;
            value.errorTempCount = fMap.get(key).errorTempCount;
            value.normalCount = fMap.get(key).normalCount;
            value.stopCount = fMap.get(key).stopCount;
          } else {
            value.allCount = 0;
            value.errorPerformCount = 0;
            value.errorTempCount = 0;
            value.normalCount = 0;
            value.stopCount = 0;
          }
        });
        return factoryMap;
      }));
    }));
  }

  public getWholesaleSummaryList() {
    return this.getList().pipe(map((list: any[]) => {
      const uMap = new Map<number, any[]>();
      for (const item of list) {
        if (uMap.has(item.user_id)) {
          uMap.get(item.user_id).push(item)
        } else {
          uMap.set(item.user_id, [item]);
        }
      }
      return uMap
    }),mergeMap(uMap => {
      return this.getUserMap().pipe(mergeMap(userMap => {
        const wholesaleList = [];
        userMap.forEach(value => {
          if (value.role === 'WHOLESALE') {
            wholesaleList.push(value);
          }
        });
        return this.getUserHasUserIncludeSelf().pipe(map((wholesaleMap:Map<number, any[]>) => {
          const summaryMap = new Map<number, summary>();
          for (const wholesale of wholesaleList) {
            if (wholesaleMap.has(wholesale.id) === false) {
              wholesaleMap.set(wholesale.id, [wholesale.id])
            }
            if (summaryMap.has(wholesale.id) === false) {
              summaryMap.set(wholesale.id, new summary());
            }
            if (wholesaleMap.has(wholesale.id)) {
              for (const userID of wholesaleMap.get(wholesale.id)) {
                if (uMap.has(userID)) {
                  let item = summaryMap.get(wholesale.id);
                  item = this.makeSummary(uMap.get(userID), item)
                }
              }
            }
            summaryMap.get(wholesale.id).id = wholesale.id;
            summaryMap.get(wholesale.id).name = userMap.has(wholesale.id) ? userMap.get(wholesale.id).name : '';
            summaryMap.get(wholesale.id).login_id = userMap.has(wholesale.id) ? userMap.get(wholesale.id).login_id : '';
          }
          return summaryMap;
        }));
      }));
    }));
  }

  public getRetailSummaryList() {
    return this.getList().pipe(map((list: any[]) => {
      const uMap = new Map<number, any[]>();
      for (const item of list) {
        if (uMap.has(item.user_id)) {
          uMap.get(item.user_id).push(item)
        } else {
          uMap.set(item.user_id, [item]);
        }
      }
      return uMap;
    }),mergeMap((uMap: Map<number, any[]>) => {
      return this.getUserMap().pipe(map(userMap => {
        const retailList = [];
        userMap.forEach(value => {
          if (value.role === 'RETAIL') {
            retailList.push(value);
          }
        });
        const summaryMap = new Map<number, summary>();
        for (const retail of retailList) {
          if (summaryMap.has(retail.id) === false) {
            summaryMap.set(retail.id, new summary());
          }
          if (uMap.has(retail.id)) {
            let item = summaryMap.get(retail.id);
            item = this.makeSummary(uMap.get(retail.id), item);
          }
          summaryMap.get(retail.id).id = retail.id;
          summaryMap.get(retail.id).name = retail.name;
          summaryMap.get(retail.id).login_id = retail.login_id;
        }
        return summaryMap;
      }));
    }),);
  }

  public getFactoryUserID(id: number) {
    return this.getUserHasFactoryList(id).pipe(map(list => {
      if (list.length == 0) {
        return '';
      } else {
        return list[0].user_id;
      }
    }));
  }

  private makeSummary(list: any[], item: summary) {
    for (const miner of list) {
      item.allCount++;
      switch (miner.status) {
        case MinerErrorStatus.HashRate:
          item.errorPerformCount++;
          break;
        case MinerErrorStatus.NoWorker:
          item.stopCount++;
          break;
        case MinerErrorStatus.OverTemp:
          item.errorTempCount++;
          break;
        default:
          item.normalCount++;
      }
    }
    return item;
  }

  private getList() {
    return this.http.get(process.env.API_URL + '/api/miner/list/all/status');
  }

  private getFactoryMap() {
    if (this.factoryMap) {
      return of(this.factoryMap);
    } else {
      return this.factory.listAll().pipe(map(list => {
        const factoryMap = new Map<number, any>();
        for (const factory of list) {
          factoryMap.set(factory.id, factory);
        }
        this.factoryMap = factoryMap;
        return factoryMap;
      }));
    }
  }

  private getUserMap() {
    if (this.userMap) {
      return of(this.userMap);
    } else {
      return this.http.get(process.env.API_URL + '/api/user/list/all').pipe(map((list: any[]) => {
        const userMap = new Map<number, any>();
        for (const user of list) {
          userMap.set(user.id, user);
        }
        this.userMap = userMap;
        return userMap;
      }));
    }
  }

  private getUserHasUserIncludeSelf() {
    if (this.wholesaleUsersMap) {
      return of(this.wholesaleUsersMap);
    }
    return this.http.get(process.env.API_URL + '/api/user/list/has_user/all').pipe(map((list: any[]) => {
      const userHasMap = new Map<number, number[]>();
      for (const user of list) {
        if (userHasMap.has(user.parent_id) === false) {
          userHasMap.set(user.parent_id, [user.parent_id])
        }
        userHasMap.get(user.parent_id).push(user.user_id)
      }
      this.wholesaleUsersMap = userHasMap;
      return userHasMap;
    }));
  }

  private getUserHasFactoryList(factoryID: number) {
    if (this.factoryHasUsersMap.has(factoryID)) {
      return of(this.factoryHasUsersMap.get(factoryID))
    }
    return this.http.get(process.env.API_URL + '/api/user/list/has_factory/by_factory/' + factoryID).pipe(map((list: any[]) => {
      this.factoryHasUsersMap[factoryID] = list;
      return list;
    }));
  }
}
