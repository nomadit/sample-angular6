import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FactoryPcModalService } from './service';

@Component({
  selector: 'modal-content',
  templateUrl: './component.html',
  providers: [FactoryPcModalService]
})
export class FactoryPcModalComponent {
  public type: string = '';
  public pc: any = {};
  public minerList: any[] = [];
  public factoryName: string = '';
  public isOpenServiceNav: boolean = false;
  public user;

  constructor(private bsModalRef: BsModalRef,
              private factoryPcModalService: FactoryPcModalService) {
  }

  public setModal(pc: any, minerList: any[], factoryList: any[], type: string): void {
    this.type = type;
    this.pc = pc;
    this.minerList = minerList;
    for (let factory of factoryList) {
      if (pc.factory_id === factory.id) {
        this.factoryName = factory.name;
        break;
      }
    }
    const userIDSet = new Set();
    for (let miner of this.minerList) {
      userIDSet.add(miner.user_id)
    }
    if (userIDSet.size === 1) {
      let userID: number = 0;
      userIDSet.forEach(id => {
        userID = id
      });
      this.factoryPcModalService.getUser(userID).subscribe( item => {
        this.user = item
      })
    }
  }

  public startMiner() {
    this.factoryPcModalService.startMiner(this.minerList).subscribe(() => {
      alert('지금부터 마이너가 실행됩니다.');
      this.doToggleOpenServiceNav()
    }, err => {
      alert('변경 실패했습니다.');
      console.error(err)
    });
  }

  public stopMiner() {
    this.factoryPcModalService.stopMiner(this.minerList).subscribe(() => {
      alert('지금부터 마이너 실행이 중지됩니다.');
      this.doToggleOpenServiceNav()
    }, err => {
      alert('변경 실패했습니다.');
      console.error(err)
    });
  }

  public changeType(type: string) {
    this.type = type;
  }

  public doToggleOpenServiceNav() {
    this.isOpenServiceNav = !this.isOpenServiceNav;
  }

  public close() {
    this.bsModalRef.hide();
  }
}
