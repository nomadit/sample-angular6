
import {map, mergeMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ChangeWalletModalComponent } from '../../modal/change.wallet/component';
import { CONSTS } from '../../../const';
import { Service } from '../service';
import { BsModalService } from 'ngx-bootstrap';
import { ChangeCoinModalComponent } from '../../modal/change.coin/component';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-monitoring',
  templateUrl: './component.html',
  styleUrls: ['../component.css'],
  providers: [Service]
})
export class WholesaleComponent implements OnInit {
  public page: any; // with child
  public pageQuery = {
    retailID: 0,
    allIDs: [],
    type: 'all',
  };
  public summary = {
    totalCount: 0,
    wholesaleCount: 0,
    retailCount: 0,
  };
  public retailList: any[];
  public isSelectedAll: boolean = false;
  public selectedList = [];
  public currentUserID = 0;
  public isAdmin: boolean = false;

  constructor(private modalService: BsModalService,
              private service: Service) {
  }

  public ngOnInit(): void {
    this.service.getUserInfo().subscribe(info => {
      this.currentUserID = info.id;
    });
    this.page = {
      pageNum: 0,
      perPage: CONSTS.DEFAULT_PER_PAGE,
      totalCount: 0,
      list: []
    };
    this.getSummaryForCustomer();
    this.getRetailList().subscribe(() => {
      this.service.getUserInfo().subscribe(info => {
        this.pageQuery.allIDs.push(info.id);
        for (const retail of this.retailList) {
          this.pageQuery.allIDs.push(retail.id);
        }
        this.getPage(1);
      });
    });
    this.isAdmin = this.service.isAdmin();
  }

  public refresh() {
    this.getPage(this.page.pageNum);
  }

  public selectType(radio: string) {
    if (radio === 'self') {
      this.service.getUserInfo().subscribe(info => {
        this.currentUserID = info.id;
      });
    }
    if (radio !== 'retail' && this.pageQuery.retailID !== 0) {
      this.pageQuery.retailID = 0;
    }
    this.pageQuery.type = radio;
    if (radio === 'retail' && this.pageQuery.retailID === 0) {
      this.selectedList = [];
      this.isSelectedAll = false;
    } else {
      this.getPage(1);
    }
  }

  public selectRetail(id: string) {
    this.pageQuery.type = 'retail';
    const selectID = parseInt(id);
    this.currentUserID = selectID;
    if (selectID !== 0 && selectID !== this.pageQuery.retailID) {
      this.pageQuery.retailID = selectID;
      this.getPage(1);
    } else {
      this.pageQuery.retailID = selectID;
    }
  }

  public changeAllWallet() {
    if (this.pageQuery.type === 'error' || this.pageQuery.type === 'all' ||
      (this.pageQuery.type === 'retail' && this.pageQuery.retailID === 0)) {
      alert('해당 기능은 사용자별로 채굴기를 선택한 경우에만 사용이 가능합니다.');
      return;
    }
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
    if (this.pageQuery.type === 'error' || this.pageQuery.type === 'all') {
      alert('해당 기능은 사용자별로 채굴기를 선택한 경우에만 사용이 가능합니다.');
      return;
    }
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    const bsModalRef = this.modalService.show(ChangeCoinModalComponent, {class: 'center-modal', animated: true});
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

  public getName(id: string, list?: any[]) {
    let name: string = '';
    if (list.length === 0) {
      this.service.getUserInfo().subscribe(info => {
        return info.name;
      });
    } else {
      for (let item of list) {
        if (item.id === parseInt(id, 10)) {
          name = item.name;
          break;
        }
      }
    }
    return name;
  }

  public getPage(pageNum: number) {
    if (isNaN(pageNum) || pageNum === 0) {
      pageNum = 1;
    }
    this.page.perPage = CONSTS.DEFAULT_PER_PAGE;
    if ((pageNum - 1) * this.page.perPage > this.page.totalCount) {
      console.log('not working', (pageNum - 1) * this.page.perPage, this.page.totalCount);
      return;
    }
    this.service.getPage(pageNum, this.page.perPage, this.pageQuery).subscribe(page => {
      if (page) {
        if (this.pageQuery.type === 'error') {
          this.page = {
            list: page,
            pageNum: 1,
            perPage: page.length,
            totalCount: page.length,
          };
        } else {
          this.page = page;
        }
        this.selectedList = [];
        this.isSelectedAll = false;
        window.scrollTo(0, 0);
      }
    });
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

  private getRetailList() {
    this.retailList = [];
    return this.service.getUserInfo().pipe(mergeMap(info => {
      return this.service.getRetailList(info.id).pipe(map((list: any) => {
        this.retailList = list;
      }));
    }))
  }

  private getSummaryForCustomer() {
    this.service.getCountMapByWholesale().subscribe((map: any) => {
      this.summary.totalCount = map.wholesaleCnt + map.retailCnt;
      this.summary.wholesaleCount = map.wholesaleCnt;
      this.summary.retailCount = map.retailCnt;
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
