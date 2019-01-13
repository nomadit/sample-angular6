import { Component, OnInit, ViewChild } from '@angular/core';
import { PcListMobileComponent } from '../../customer/list/mobile/component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CONSTS } from '../../const';
import { Service } from '../service';

@Component({
  selector: 'app-monitoring',
  templateUrl: './component.html',
  animations: [
    trigger('toggleHeight', [
      state('off', style({
        display: 'none',
        height: '0',
        opacity: '0'
      })),
      state('on', style({
        display: 'block',
        height: '*',
        opacity: '1'
      })),
      transition('off => on', animate('200ms ease-in')),
      transition('on => off', animate('200ms ease-out'))
    ])
  ]
})

export class FactoryMobileComponent implements OnInit {
  public factoryList: any[]; // only
  public factoryIDList: any[];
  public selectedFactoryID: number; // only
  public minerList: any[]; // only
  public pcList: any[]; // with child
  public minerStatMap: Map<number, any[]>; // with child
  public pcIdNMinersMap: Map<number, any[]>; // with child
  public minerPlugMap: Map<number, any>; // with child
  public pcRebootCountMap: Map<number, number>;
  public cntPCList: number;
  // selectedRadio
  public selectedRadio: string; // only
  public selectedError: number; // only
  public selectedAll: number;
  // Dict for Pagination
  public pager: any = {};
  public pageNum: number;
  // if pc list is empty Set default page
  public setDefaultPage: boolean;
  public emptyErrorList: boolean;
  @ViewChild(PcListMobileComponent) public pcListComponent: any;
  public toggleOn: { [menu: string]: string } = {
    Tip: 'off',
    Select: 'on',
  };

  private perPage: number;
  private DefaultPerPage = 50;

  constructor(private service: Service) {
  }

  public ngOnInit(): void {
    this.selectedRadio = 'error';
    this.factoryList = [];
    this.factoryIDList = [];
    this.selectedFactoryID = -1;
    this.selectedError = 0;
    this.selectedAll = 0;
    this.minerList = [];
    this.pcList = [];
    this.pcRebootCountMap = new Map();
    this.pcIdNMinersMap = new Map();
    this.minerPlugMap = new Map<number, any>();
    this.cntPCList = 0;
    // Set page row count - If needed reduce or increase this number
    this.perPage = this.DefaultPerPage;
    this.pageNum = 1;
    this.setDefaultPage = true;
    this.emptyErrorList = true;

    // this.service.getFactoryListForFactory((list) => {
    //   let idSet: Set<number> = new Set();
    //   for (let item of list) {
    //     idSet.add(item.factory_id);
    //   }
    //   if (idSet.size > 0) {
    //     this.service.getFactoryListByIDs(idSet, (factoryList) => {
    //       this.factoryList = factoryList;
    //       for (let factory of this.factoryList) {
    //         this.factoryIDList.push(factory.id);
    //       }
    //       // For use factoryList on initData - jeKim 171215
    //       this.initData(true);
    //     });
    //   }
    // });
  }

  public refresh() {
    this.initData(true);
  }

  public rebootPCAll() {
    let checkedList = this.pcListComponent.checkedList;
    if (checkedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    if (confirm('선택하신 채굴기를 재부팅하시겠습니까?')) {
      alert('채굴기가 재부팅되고 있습니다.');
    } else {
      return;
    }
  }

  public rebootPlugAll() {
    alert('준비 중입니다.');
    // let checkedList = this.pcListComponent.checkedList;
    // if (checkedList.length === 0) {
    //   alert(this.ALERT_NOT_SELECTED_PC);
    //   return;
    // }
    // this.service.rebootPlugs(checkedList, (res: any) => {
    //   this.pcListComponent.initCheckList();
    //   this.initData(false);
    // }, (err: any) => {
    //   console.error(err);
    // });
  }

  public selectRadio(radio: string) {
    this.selectedRadio = radio;
    let error = -1;
    let all = -1;
    let factoryID = -1;
    switch (radio) {
      case 'error':
        error = 0;
        all = -1;
        factoryID = -1;
        break;
      case 'all':
        error = -1;
        all = 0;
        factoryID = -1;
        break;
      default:
        alert('잘 못 된 로직입니다. 개발자에게 문의해주세요.');
        return;
    }
    if (this.isChangedSelected(error, all, factoryID)) {
      this.pageNum = 1;
      this.selectedError = error;
      this.selectedAll = all;
      this.selectedFactoryID = factoryID;
      this.initData(true);
    }
  }

  public selectFactory(id: number) {
    this.selectedRadio = 'factory';
    if (this.isChangedSelected(-1, -1, id)) {
      this.pageNum = 1;
      this.selectedError = -1;
      this.selectedAll = -1;
      this.selectedFactoryID = id;
      this.initData(true);
    }
  }

  public getName(id: string , list: any[]) {
    let name: string = '';
    for (let item of list) {
      if (item.id === parseInt(id, 10)) {
        name = item.name;
        break;
      }
    }
    return name;
  }

  public getPage(page: number) {
    if (isNaN(page) || page === 0)  {
      page = 1;
    }
    this.pageNum = page;
    let factoryIDs: number[] = [];
    // In case All/Factory radio button clicked
    if (this.selectedFactoryID <= 0) {
      for (let factory of this.factoryList) {
        factoryIDs.push(factory.id);
      }
    } else if (this.selectedFactoryID > 0) { // Select specific factory
      factoryIDs.push(this.selectedFactoryID);
    }
    if (factoryIDs.length > 0) {
      // this.service.getPageByFactoryIDs(factoryIDs, this.pageNum, this.perPage, (pagingMap: any) => {
      //   if (pagingMap) {
      //     if (pagingMap.list.length === 0) {
      //       this.setDefaultPage = true;
      //       this.emptyErrorList = false;
      //       return;
      //     }
      //     this.setDefaultPage = false;
      //     this.pcList = pagingMap.list;
      //     this.cntPCList = pagingMap.totalCount;
      //     this.setMinerMap(this.pcList);
      //     // scroll to top after page change
      //     window.scrollTo(0, 0);
      //   }
      // });
    } else {
      this.setDefaultPage = true;
      this.emptyErrorList = false;
    }
  }

  public toggleMenu(menu: string, event: Event) {
    event.preventDefault();
    this.toggleOn[menu] = (this.toggleOn[menu] === 'on' ? 'off' : 'on');
  }

  private setMinerMap(pcList: any[]) {
    let getPcList = false;
    this.minerList = [];
    let pcIDs: any[] = [];
    // set pc id list on pcIDs for gathering miner list
    for (let pc of pcList) {
      pcIDs.push(pc.id);
    }
    if (pcIDs.length > 0) {
    }
  }

  private initData(isNeedStat: boolean) {
    let that = this;
    let getPcList: boolean = true;
    that.pcList = [];
    that.minerList = [];
    if (this.selectedError > -1) {
      console.log('getErrorListForFactory', 'Factory');
      this.service.getMinerErrorListForFactory(this.factoryIDList, (list: any[]) => {
        that.minerList = list;
        if (that.minerList.length === 0) {
          this.setDefaultPage = true;
          this.emptyErrorList = true;
          return ;
        }
        this.setDefaultPage = false;
        this.emptyErrorList = false;
        this.setAboutPc(getPcList);
        if (isNeedStat) {
          this.getStat();
        }
        this.getPCRebootCountMap();
      });
    } else if (this.selectedAll > -1) {
      console.log('getPcPageListByFactory', 'all');
      // Set pcList with Pagination
      this.getPage(this.pageNum);
    } else if (this.selectedFactoryID > -1) {
      console.log('getListByFactory', 'factory');
      this.getPage(this.pageNum);
    }
  }

  private setAboutPc(getPcList: boolean) {
    let that = this;
    let pcIDs = new Set();
    this.pcIdNMinersMap = new Map();
    for (let miner of that.minerList) {
      pcIDs.add(miner.pc_id);
      if (!that.pcIdNMinersMap.has(miner.pc_id)) {
        that.pcIdNMinersMap.set(miner.pc_id, []);
      }
      that.pcIdNMinersMap.get(miner.pc_id).push(miner);
    }
    if (getPcList) {
    }
  }

  private isChangedSelected(errorId: number, allID: number, factoryID: number) {
    if (this.selectedError !== errorId) {
      return true;
    }
    if (this.selectedAll !== allID) {
      return true;
    }
    if (this.selectedFactoryID !== factoryID) {
      return true;
    }
    return false;
  }

  private getStat() {
    let ids: number[] = [];
    this.minerStatMap = new Map();
    for (let item of this.minerList) {
      ids.push(item.id);
    }
  }

  private getPCRebootCountMap() {
  }
}
