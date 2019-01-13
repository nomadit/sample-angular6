import { Component, OnInit } from '@angular/core';
import { ChangeWalletModalComponent } from '../../modal/change.wallet/component';
import { ChangeCoinModalComponent } from '../../modal/change.coin/component';
import { CONSTS } from '../../../const';
import { Service } from '../service';
import { BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-monitoring',
  templateUrl: './component.html',
  providers: [Service]
})
export class RetailComponent implements OnInit {
  public page: any; // with child
  public isSelectedAll: boolean = false;
  public selectedList = [];
  public currentUserID = 0;

  constructor(private service: Service,
              private modalService: BsModalService) {
  }

  public ngOnInit(): void {
    this.page = {
      pageNum: 0,
      perPage: CONSTS.DEFAULT_PER_PAGE,
      totalCount: 0,
      list: []
    };
    this.service.getUserInfo().subscribe(info => {
      this.currentUserID = info.id;
    });
    this.getPage(1);
  }

  public refresh() {
    this.getPage(this.page.pageNum);
  }

  public changeAllWallet() {
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    const bsModalRef = this.modalService.show(ChangeWalletModalComponent, {class: 'center-modal'});
    if (bsModalRef.content) {
      (<ChangeWalletModalComponent> bsModalRef.content).setModal(this.getSelectedMinerList());
      bsModalRef.content.onClose.subscribe(ret => {
        setTimeout(bsModalRef.hide, 150);
        if (ret.isModified) {
          this.updateSelectedAll();
          this.getPage(this.page.pageNum);
        } else if (ret.retCode === 'DEFERENCE_COIN' || ret.retCode === 'DEFERENCE_MINING_METHOD' || ret.retCode === 'EMPTY') {
          this.changeAllCoin();
        }
      });
    }
  }

  public changeAllCoin() {
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    const bsModalRef = this.modalService.show(ChangeCoinModalComponent, {class: 'center-modal'});
    if (bsModalRef.content) {
      (<ChangeCoinModalComponent> bsModalRef.content).setModal(this.getSelectedMinerList());
      bsModalRef.content.onClose.subscribe(isModified => {
        setTimeout(bsModalRef.hide, 150);
        if (isModified) {
          this.updateSelectedAll();
          this.getPage(this.page.pageNum);
        }
      });
    }
    return;
  }

  public updateSelectedAll() {
    this.toggleSelectedAll();
    if (this.isSelectedAll) {
      for (const item of this.page.list) {
        if (this.selectedList.indexOf(item.id) == -1) {
          this.selectedList.push(item.id)
        }
      }
    } else {
      this.selectedList = [];
    }
  }

  public toggleSelectedAll() {
    this.isSelectedAll = !this.isSelectedAll;
  }

  public getPage(pageNum: number) {
    if (isNaN(pageNum) || pageNum === 0) {
      pageNum = 1;
    }
    if ((pageNum - 1) * this.page.perPage > this.page.totalCount) {
      console.log('not working', (pageNum - 1) * this.page.perPage, this.page.totalCount);
      return;
    }
    this.service.getPage(pageNum, this.page.perPage).subscribe(page => {
      if (page) {
        this.page = page;
        this.selectedList = [];
        window.scrollTo(0, 0);
      }
    });
  }

  private getSelectedMinerList() {
    const map = new Map();
    for (const item of this.page.list) {
      map.set(item.id, item);
    }
    const selectedMinerList = [];
    for (const id of this.selectedList) {
      selectedMinerList.push(map.get(id))
    }
    return selectedMinerList;
  }
}
