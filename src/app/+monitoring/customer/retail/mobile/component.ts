import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ChangeWalletModalComponent } from '../../modal/change.wallet/component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PcListMobileComponent} from '../../list/mobile/component';
import { ChangeCoinModalComponent } from '../../modal/change.coin/component';
import { Concurrency } from '../../../../shared/config/const';
import { animate, state, style, transition, trigger } from '@angular/animations';
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

export class RetailMobileComponent implements OnInit {
  public factoryList: any[]; // only
  public minerPage: any; // only
  public selectedRadio: string;
  public retailList: any[];
  public pcList: any[]; // with child
  public minerStatMap: Map<number, any[]>; // with child
  public pcIdNMinersMap: Map<number, any[]>; // with child
  public minerPlugMap: Map<number, any>; // with child
  public bsModalRef: BsModalRef;
  public cntPCList: number;
  public pageNum: number;
  public setDefaultPage: boolean;
  // var for Pagination
  public coinSummationMap: Map<string, any>;
  public coinList: string[];
  public keys: any[];

  public toggleOn: { [menu: string]: string } = {
    Tip: 'off',
    ETH: 'off',
    ETC: 'off',
    ZCH: 'off',
  };

  private perPage: number;
  private CoinOrder = ['ETH', 'ETC'];
  private DefaultPerPage = 50;

  @ViewChild(PcListMobileComponent) public pcListComponent: any;

  constructor(private injector: Injector,
              private service: Service,
              private modalService: BsModalService) {
    // this.keys = Object.keys(this.concurrencyInfo);
  }

  public ngOnInit(): void {
    this.selectedRadio = 'all';
    this.retailList = [];
    this.factoryList = [];
    this.minerPage = {};
    this.pcList = [];
    this.pcIdNMinersMap = new Map();
    this.minerPlugMap = new Map<number, any>();
    this.cntPCList = 0;
    // Set page row count - If needed reduce or increase this number
    this.perPage = this.DefaultPerPage;
    this.pageNum = 1;
    this.setDefaultPage = true;
    this.coinSummationMap = new Map();
    this.coinList = this.CoinOrder;
    this.initData();
  }

  public refresh() {
    this.initData();
  }

  public changeAllWallet() {
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
          this.initData();
        }
      });
    }
  }

  public changeAllCoin() {
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
          this.initData();
        }
      });
    }
    return;
  }

  public getPage(page: number) {
    if (isNaN(page) || page === 0) {
      page = 1;
    }
    let userIDs: number[] = [];
    // userIDs.push(this.service.getUserID());
  }

  public toggleMenu(menu: string, event: Event) {
    event.preventDefault();
    this.toggleOn[menu] = (this.toggleOn[menu] === 'on' ? 'off' : 'on');
  }

  private initData() {
    this.pcList = [];
    this.pcIdNMinersMap = new Map();
    // get balance
    let userIDs: number[] = [];
    // userIDs.push(this.service.getUserID());
    // get wallet balance & krw with bithumb exchange rate
    // this.service.getBithumbExchangeRateAndCoinMap(userIDs[0], this.coinList, (map: any) => {
    //   console.log('component map', map);
    //   this.coinSummationMap = map;
    // });
    this.getPage(this.pageNum);
  }

  private setFactoryList() {
    let idSet: Set<number> = new Set();
    for (let item of this.minerPage.list) {
      idSet.add(item.factory_id);
    }
    if (idSet.size > 0) {
    }
  }

  private setAboutPc() {
    this.pcList = [];
    this.pcIdNMinersMap = new Map();
    let pcIDs = new Set();
    let pcIDList: any[] = [];
    for (let miner of this.minerPage.list) {
      pcIDs.add(miner.pc_id);
      if (pcIDList.indexOf(miner.pc_id) === -1) {
        pcIDList.push(miner.pc_id);
      }
      if (!this.pcIdNMinersMap.has(miner.pc_id)) {
        this.pcIdNMinersMap.set(miner.pc_id, []);
      }
      this.pcIdNMinersMap.get(miner.pc_id).push(miner);
    }
    let pcMap: Map<number, any> = new Map();
  }

  private getStat() {
    let ids: number[] = [];
    this.minerStatMap = new Map();
    for (let item of this.minerPage.list) {
      ids.push(item.id);
    }
  }
}
