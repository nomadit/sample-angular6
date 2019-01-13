import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { Service } from './service';

@Component({
  selector: 'modal-content',
  templateUrl: './component.html',
})
export class HisModalComponent {
  public type: string;
  public hostname: string;
  public factoryName: string;
  public viewList: any[];
  // public memo: string = '';
  public isModified = false;
  public role: string = '';
  private systemHisList: any[] = [];
  private systemHisCnt = 0;
  private id: number;
  private factoryID: number;

  constructor(public bsModalRef: BsModalRef,
              private service: Service) {
  }

  public setModal(pc: any, type: string): void {
    this.hostname = pc.hostname;
    this.id = pc.id;
    this.factoryID = pc.factory_id;
    this.type = type;
    this.service.getUserInfo().subscribe(info => this.role = info.role);
    this.isModified = false;
    this.initData();
  }

  public changeType(type: string) {
    this.type = type;
    if (this.type === 'SYSTEM') {
      this.viewList = this.systemHisList;
    }
  }

  public close() {
    this.bsModalRef.hide();
  }
private initData(): void {
    let that = this;
    this.service.getListSystemHis(this.id).subscribe(list => {
      if (!list || !Array.isArray(list) || list.length === 0) {
        return;
      }
      console.log('this.system list', that.systemHisList);
      that.systemHisList = list;
      that.systemHisCnt = list.length;
      // that.setUserInfoList(that.systemHisList);
      that.changeType(that.type);
    });
    this.service.getFactoryByID(this.factoryID).subscribe((item) => {
      that.factoryName = item.name;
    });
  }
}
