import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { ChangeWalletModalComponent } from '../../modal/change.wallet/component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PcListMobileComponent } from '../../list/mobile/component';
import { ChangeCoinModalComponent } from '../../modal/change.coin/component';
import { Concurrency } from '../../../../shared/config/const';
import { CONSTS } from '../../../const';
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

export class WholesaleMobileComponent implements OnInit {
  public factoryList: any[]; // only
  public minerList: any[]; // only
  public selectedRetailID: number;
  public selectedRadio: string;
  public totalNum: number;
  public selfNum: number;
  public consignNum: number;
  public retailList: any[];
  public pcList: any[]; // with child
  public minerStatMap: Map<number, any[]>; // with child
  public pcIdNMinersMap: Map<number, any[]>; // with child
  public minerPlugMap: Map<number, any>; // with child
  public bsModalRef: BsModalRef;
  public cntPCList: number;
// var for Pagination
  public pager: any = {};
  public pageNum: number;
  public coinSummationMap: Map<string, any>;
  public coinList: string[];
  public concurrencyInfo = Concurrency;
  public keys: any[];
  // if pc list is empty Set default page
  public setDefaultPage: boolean;
  public emptyErrorList: boolean;
  @ViewChild(PcListMobileComponent) public pcListComponent: any;

  public toggleOn: { [menu: string]: string } = {
    Tip: 'off',
    Select: 'on',
    ETH: 'off',
    ETC: 'off',
    ZCH: 'off',
  };
  private perPage: number;
  private CoinOrder = ['ETH', 'ETC'];
  private DefaultPerPage = 50;

  constructor(private injector: Injector,
              private service: Service,
              private modalService: BsModalService) {
    this.keys = Object.keys(this.concurrencyInfo);
  }

  public ngOnInit(): void {
    this.selectedRetailID = -1;
    this.selectedRadio = 'error';
    this.totalNum = 0;
    this.selfNum = 0;
    this.consignNum = 0;
    this.retailList = [];
    this.factoryList = [];
    this.minerList = [];
    this.pcList = [];
    this.pcIdNMinersMap = new Map();
    this.minerPlugMap = new Map<number, any>();
    this.coinSummationMap = new Map();
    this.cntPCList = 0;
    // Set page row count - If needed reduce or increase this number
    this.perPage = this.DefaultPerPage;
    this.pageNum = 1;
    this.coinList =  this.CoinOrder;
    this.setDefaultPage = true;
    this.emptyErrorList = true;

    this.initData(true);
  }

  public refresh() {
    this.initData(true);
  }

  public selectRadio(radio: string) {
    this.selectedRadio = radio;
    this.pageNum = 1;
    if (this.pcListComponent) {
      this.pcListComponent.initSelectedPCList();
    }
    switch (this.selectedRadio) {
      case 'error':
        this.initData(true);
        this.selectedRetailID = -1;
        break;
      case 'all':
        this.initData(true);
        this.selectedRetailID = -1;
        break;
      case 'self':
        this.initData(true);
        this.selectedRetailID = -1;
        break;
      default:
        console.error('오류입니다.', this.selectedRadio);
    }
  }

  public selectRetail(id: string) {
    this.selectedRadio = 'consign';
    let selectID = parseInt(id, 10);
    this.pageNum = 1;
    this.selectedRetailID = selectID;
    if (this.pcListComponent) {
      this.pcListComponent.initSelectedPCList();
    }
    this.initData(true);
  }

  public changeAllWallet() {
    if (this.selectedRetailID <= 0 && this.selectedRadio !== 'self') {
      alert('해당 기능은 사용자별로 채굴기를 선택한 경우에만 사용이 가능합니다. ');
      return;
    }
    let checkedList = this.pcListComponent.checkedList;
    if (checkedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    let minerList: any[] = [];
    for (let pcID of checkedList) {
      for (let miner of this.pcIdNMinersMap.get(pcID)) {
        minerList.push(miner);
      }
    }
    if (minerList.length === 0) {
      alert('수행중인 마이너가 없습니다 확인해 주세요.');
      return;
    }

    let minerCoinList: string[] = [];
    // Check different coin type of miner list
    for (let miner of minerList) {
      // If miner's coin is not in minerCoinList, Add it to list
      if (minerCoinList.indexOf(miner.coin) === -1) {
        minerCoinList.push(miner.coin);
      }
    }
    // if different coin type exist in minerCoinList changeAllWallet function cancelled
    if (minerCoinList.length > 1) {
      alert('지갑 일괄변경은 동일한 코인을 채굴 중인 PC들을 선택했을 경우에만 가능합니다.');
      return;
    }

    this.bsModalRef = this.modalService.show(ChangeWalletModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<ChangeWalletModalComponent> this.bsModalRef.content).setModal(minerList);
      this.bsModalRef.content.onClose.subscribe(isModified => {
        if (isModified) {
          this.pcListComponent.initCheckList();
          this.initData(false);
        }
      });
    }
  }

  public toggleMenu(menu: string, event: Event) {
    event.preventDefault();
    this.toggleOn[menu] = (this.toggleOn[menu] === 'on' ? 'off' : 'on');
  }


  public changeAllCoin() {
    if (this.selectedRetailID <= 0 && this.selectedRadio !== 'self') {
      alert('해당 기능은 사용자별로 채굴기를 선택한 경우에만 사용이 가능합니다.');
      return;
    }
    let checkedList = this.pcListComponent.checkedList;
    if (checkedList.length === 0) {
      alert(CONSTS.ALERT_MUST_CHECK_PC_LIST);
      return;
    }
    let minerList: any[] = [];
    for (let pcID of checkedList) {
      for (let miner of this.pcIdNMinersMap.get(pcID)) {
        minerList.push(miner);
      }
    }
    if (minerList.length === 0) {
      alert('수행중인 마이너가 없습니다 확인해 주세요.');
      return;
    }
    this.bsModalRef = this.modalService.show(ChangeCoinModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<ChangeCoinModalComponent> this.bsModalRef.content).setModal(minerList);
      this.bsModalRef.content.onClose.subscribe(isModified => {
        if (isModified) {
          this.pcListComponent.initCheckList();
          this.initData(false);
        }
      });
    }
    return;
  }

  public getPage(page: number) {
    if (isNaN(page) || page === 0)  {
      page = 1;
    }
    this.pageNum = page;
    let userIDs = this.getUIUserIDs();
    // this.service.getMinerMapByRoleForPaging(userIDs, this.pageNum, this.perPage, (map: any) => {
    //   if (map) {
    //     if (map.list.length === 0) {
    //       this.setDefaultPage = true;
    //       this.emptyErrorList = false;
    //       return;
    //     }
    //     this.setDefaultPage = false;
    //     this.cntPCList = map.totalCount;
    //     this.initView(map.list, true, false);
    //     // scroll to top after page change
    //     window.scrollTo(0, 0);
    //   }
    // });
  }

  public getName(id: string , list?: any[]) {
    return name;
  }

  private getUIUserIDs() {
    let userIDs = [];
    // if (this.selectedRadio === 'all') {
    //   if (this.retailList) {
    //     for (let retail of this.retailList) {
    //       if (retail) {
    //         userIDs.push(retail.id);
    //       }
    //     }
    //     userIDs.push(this.service.getUserID());
    //   } else {
    //     userIDs.push(this.service.getUserID());
    //   }
    // } else if (this.selectedRadio === 'self') {
    //   userIDs.push(this.service.getUserID());
    // } else if (this.selectedRadio === 'consign') {
    //   if (this.selectedRetailID <= 0) {
    //     if (this.retailList) {
    //       for (let retail of this.retailList) {
    //         if (retail) {
    //           userIDs.push(retail.id);
    //         }
    //       }
    //     }
    //   } else {
    //     userIDs.push(this.selectedRetailID);
    //   }
    // } else {
    //   userIDs = [];
    // }
    return userIDs;
  }

  private initData(isNeedStat: boolean) {
    let that = this;
    that.pcList = [];
    that.pcIdNMinersMap = new Map();

    switch (this.selectedRadio) {
      case 'error':
        // this.service.getMinerErrorListByUserID(this.service.getUserID(), (list: any) => {
        //   console.log('res list', list);
        //   if (list.length === 0) {
        //     this.setDefaultPage = true;
        //     this.emptyErrorList = true;
        //   } else {
        //     this.setDefaultPage = false;
        //     this.emptyErrorList = false;
        //   }
        //   this.initView(list, isNeedStat, true);
        // });
        break;
      case 'all':
        // Set pcList with Pagination
        this.getPage(this.pageNum);
        break;
      case 'self':
        this.getPage(this.pageNum);
        break;
      case 'consign':
        this.getPage(this.pageNum);
        break;
      default:
        console.error('오류입니다.', this.selectedRadio);
    }
    if (this.selectedRadio === 'self' || this.selectedRadio === 'consign') {
      // get wallet balance & krw with bithumb exchange rate
      // this.service.getBithumbExchangeRateAndCoinMap(this.getUIUserIDs()[0], this.coinList, (map: any) => {
      //   console.log('component map', map);
      //   this.coinSummationMap = map;
      // });
    }
  }

  private initView(minerList: number[], isNeedStat: boolean, orderByPcHostName: boolean) {
    this.minerList = minerList;
    if (this.minerList.length > 0) {
      this.setAboutPc(orderByPcHostName);
      this.setFactoryList();
      if (isNeedStat) {
        this.getStat();
      }
    }
    this.setRetailList();
  }

  private setRetailList() {
    // this.service.getRetailListMapByWholesaleIDs([this.service.getUserID()], (map: any) => {
    //   this.retailList = map[this.service.getUserID()];
    // });
  }

  private setFactoryList() {
    let factoryIDSet: Set<number> = new Set();
    for (let miner of this.minerList) {
      factoryIDSet.add(miner.factory_id);
    }
    // this.service.getFactoryListByIDs(factoryIDSet, (list) => {
    //   this.factoryList = list;
    // })
  }

  private setAboutPc(orderByPcHostName: boolean) {
    let that = this;
    that.pcList = [];
    that.pcIdNMinersMap = new Map();
    let pcIDs = new Set();
    let pcIDList: any[] = [];
    for (let miner of that.minerList) {
      pcIDs.add(miner.pc_id);
      if (pcIDList.indexOf(miner.pc_id) === -1) {
        pcIDList.push(miner.pc_id);
      }
      if (!that.pcIdNMinersMap.has(miner.pc_id)) {
        that.pcIdNMinersMap.set(miner.pc_id, []);
      }
      that.pcIdNMinersMap.get(miner.pc_id).push(miner);
    }
    if (orderByPcHostName) {
      // this.service.getPcList(pcIDs, (list) => {
      //   this.pcList = list;
      //   if (this.pcList.length === 0) {this.setDefaultPage = true; return; }
      //   this.setDefaultPage = false;
      // });
    } else {
      let pcMap: Map<number, any> = new Map();
      // that.service.getPcMap(pcIDs, (map) => {
      //   for (let key of Object.keys(map)) {
      //     pcMap.set(parseInt(key, 10), map[key]);
      //   }
      //   for (let id of pcIDList) {
      //     that.pcList.push(pcMap.get(id));
      //   }
      // });
    }
  }

  private getStat() {
    let ids: number[] = [];
    this.minerPlugMap = new Map();
    for (let item of this.minerList) {
      ids.push(item.id);
    }
    // this.service.getStatMapForDual(ids, (map) => {
    //   this.minerStatMap = map;
    // });
  }
}
