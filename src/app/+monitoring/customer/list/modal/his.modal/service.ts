import { Injectable } from '@angular/core';
import { AuthService } from '../../../../../providers/auth.service';
import { PcService } from '../../../../../providers/pc.service';
import { FactoryService } from '../../../../../providers/factory.service';
import { Observable } from 'rxjs';

@Injectable()
export class Service {
  constructor(
    private auth: AuthService,
    private pc: PcService,
    private factory: FactoryService) {
  }

  public getUserInfo():Observable<any> {
    return this.auth.getInfoForMonitoring();
  }

  public getFactoryByID(factoryID: number) {
    return this.factory.getByID(factoryID);
  }

  public getListSystemHis(pcID: number) {
    return this.pc.listSystemHis(pcID);
  }
}
