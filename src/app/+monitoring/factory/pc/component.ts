import { Component, OnInit } from '@angular/core';
import { Service } from '../service';
import { CONSTS } from '../../const';
import { ChangeFactoryModalComponent } from '../_modal/change.factory/component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AssignCoinModalComponent } from '../_modal/assign.coin/component';

@Component({
  selector: 'app-monitoring',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  providers: [Service]
})

export class FactoryComponent implements OnInit {
  public factoryList: any[]; // only
  public page: any; // with child
  public pageQuery = {
    type: 'all',
    factoryID: 0,
    loginID: '',
    status: 'all'
  };
  public selectedList = [];
  public summary: any = {
    totalCount: 0,
    normalCount: 0,
    overTempCount: 0,
    lowPerformanceCount: 0,
    stopCount: 0
  };
  public isSelectedAll: boolean = false;
  public bsModalRef: BsModalRef;
  public isAdmin: boolean = false;

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
    this.factoryList = [];
    this.service.getFactoryListForFactory().subscribe((list) => {
      this.factoryList = list;
      this.getPage(1);
    }, err => {
      console.error(err);
    });

    this.isAdmin = this.service.isAdmin();
  }

  public selectType(type) {
    console.log('selectType', type);
    this.pageQuery.type = type;
    if (type === 'all') {
      this.pageQuery.factoryID = 0;
      this.pageQuery.loginID = '';
      this.pageQuery.status = 'all';
      this.getPage(1);
    }
  }

  public selectFactory(id: string) {
    const selectID = parseInt(id);
    if (selectID !== 0 && selectID !== this.pageQuery.factoryID) {
      this.pageQuery.loginID = '';
      this.pageQuery.status = 'all';
      this.pageQuery.factoryID = selectID;
      this.getPage(1);
    }
  }

  public search() {
    this.pageQuery.factoryID = 0;
    this.pageQuery.status = 'all';
    this.getPage(1);
  }

  public searchByStatus(status: string) {
    this.pageQuery.status = status;
    this.getPage(1);
  }

  public refresh() {
    this.getPage(this.page.pageNum);
  }

  public getPage(pageNum: number) {
    if (isNaN(pageNum) || pageNum === 0) {
      pageNum = 1;
    }
    if ((pageNum - 1) * this.page.perPage > this.page.totalCount) {
      console.log('not working', (pageNum - 1) * this.page.perPage, this.page.totalCount);
      return;
    }
    let factoryIDs: number[] = [];
    // In case All/Factory radio button clicked
    if (this.pageQuery.factoryID === 0) {
      for (let factory of this.factoryList) {
        factoryIDs.push(factory.id);
      }
    } else if (this.pageQuery.factoryID > 0) { // Select specific factory
      factoryIDs.push(this.pageQuery.factoryID);
    }
    this.service.getPageByFactoryIDsNLoginIDWithStatus(pageNum, this.page.perPage, factoryIDs, this.pageQuery).subscribe(page => {
      if (page) {
        this.selectedList = [];
        this.isSelectedAll = false;
        this.page = page;
        window.scrollTo(0, 0);
      }
    });
    this.service.getSummary(factoryIDs, this.pageQuery).subscribe(summary => {
      this.summary = summary;
    });
  }

  public changeFactory() {
    if (!this.isAdmin) {
      return;
    }
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    this.bsModalRef = this.modalService.show(ChangeFactoryModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<ChangeFactoryModalComponent> this.bsModalRef.content).setModal(this.selectedList);
      this.bsModalRef.content.onClose.subscribe(isModified => {
        if (isModified) {
          this.isSelectedAll = false;
          this.selectedList = [];
          this.getPage(this.page.pageNum);
        }
      });
    }
  }

  public rebootPC() {
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    if (!confirm('선택하신 채굴기를 재부팅하시겠습니까?')) {
      return;
    }
    this.service.reboots(this.selectedList).subscribe(res => {
      alert('채굴기가 재부팅되고 있습니다.');
      this.isSelectedAll = false;
      this.selectedList = [];
      this.getPage(this.page.pageNum);
    }, err => {
      console.error(err);
    });
  }

  public rebootIotPlug() {
    alert('준비중입니다.');
    // if (this.selectedList.length === 0) {
    //   alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
    //   return;
    // }
  }

  public removePC() {
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    if (!confirm('선택하신 채굴기를 삭제하시겠습니까?')) {
      return;
    }
    this.service.removeList(this.selectedList).subscribe(res => {
      alert('채굴기가 삭제되었습니다.');
      this.isSelectedAll = false;
      this.selectedList = [];
      this.getPage(this.page.pageNum);
    }, err => {
      console.error(err);
    });

  }

  public removeLog() {
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    if (!confirm('선택하신 채굴기의 로그를 삭제하시겠습니까?')) {
      return;
    }
    this.service.removeLog(this.selectedList).subscribe(res => {
      alert('채굴기의 로그들이 삭제되었습니다.');
      this.isSelectedAll = false;
      this.selectedList = [];
      this.getPage(this.page.pageNum);
    }, err => {
      console.error(err);
    });

  }

  public showIPs() {
    if (this.page.list.length === 0) {
      alert('PC가 없습니다.');
      return;
    }
    let url = '/#/monitoring/ip_list';
    let windowFeatures = 'width=500,height=600,menubar=0,toolbar=0';
    let pcListPopup = window.open(url, '_blank', windowFeatures);
    pcListPopup.opener.pcList = this.page.list;
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

  public assignCoin() {
    if (!this.isAdmin) {
      return;
    }
    if (this.selectedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    this.bsModalRef = this.modalService.show(AssignCoinModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<AssignCoinModalComponent> this.bsModalRef.content).setModal(this.selectedList);
      this.bsModalRef.content.onClose.subscribe(isModified => {
        if (isModified) {
          this.isSelectedAll = false;
          this.selectedList = [];
          this.getPage(this.page.pageNum);
        }
      });
    }
  }
}
