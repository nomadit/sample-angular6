import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MinerStat } from '../../../service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ChangeWalletModalComponent } from '../../modal/change.wallet/component';
import { ChangeCoinModalComponent } from '../../modal/change.coin/component';
import { UserService } from '../../../../providers/user.service';
import { minerErrorStatusList } from '../../../../shared/config/const';
import { Service } from '../service';

@Component({
  selector: 'mobile-pc-list',
  templateUrl: './component.html',
})

export class PcListMobileComponent implements OnChanges {
  @Input() public minerList: any[];
  @Input() public pcList: any[];
  @Input() public minerStatMap: Map<number, MinerStat>;
  @Input() public pcIdNMinersMap: Map<number, any[]>;
  @Input() public minerPlugMap: Map<number, any>;
  @Input() public factoryList: any[];
  @Input() public pcRebootCountMap: Map<number, number>;
  @Output() public onReload = new EventEmitter<void>();
  public checkedList: number[];
  public bsModalRef: BsModalRef;
  public role: string;
  public selectedPcID: number;
  public beforeClicked: number;
  public pcIDList: number[];
  public displayDetailPCList: number[] = [];
  private userMap: Map<number, any> = new Map();

  constructor(private injector: Injector,
              private service: Service,
              private modalService: BsModalService,
              private user: UserService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.initData();
    this.checkedList = [];
  }

  // init select pc list
  public initSelectedPCList() {
    this.displayDetailPCList = [];
  }

  // open pc data layer
  public showPCData(pcID: number) {
    if (this.displayDetailPCList) {
      if (this.displayDetailPCList.indexOf(pcID) === -1) {
        this.displayDetailPCList.push(pcID);
      } else {
        this.displayDetailPCList.splice(this.displayDetailPCList.indexOf(pcID), 1);
      }
    }
  }

  public updateChecked(id: number) {
    if (this.checkedList.indexOf(id) === -1) {
      this.checkedList.push(id);
    } else {
      const idx = this.checkedList.indexOf(id);
      this.checkedList.splice(idx, 1);
    }
  }

  public openChangeWallet(item: any) {
    if (this.pcIdNMinersMap.get(item.id).length === 0) {
      alert('수행중인 마이너가 없습니다 확인해 주세요.');
      return;
    }
    this.bsModalRef = this.modalService.show(ChangeWalletModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<ChangeWalletModalComponent> this.bsModalRef.content).setModal(this.pcIdNMinersMap.get(item.id));
    } else {
      alert('잠시 기다려주세요.');
    }
  }

  public openChangeCoin(item: any) {
    if (this.pcIdNMinersMap.get(item.id).length === 0) {
      alert('수행중인 마이너가 없습니다 확인해 주세요.');
      return;
    }
    this.bsModalRef = this.modalService.show(ChangeCoinModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<ChangeCoinModalComponent> this.bsModalRef.content).setModal(this.pcIdNMinersMap.get(item.id));
    } else {
      alert('잠시 기다려주세요.');
    }
  }

  public getUserName(userID: number) {
    if (this.userMap.has(userID)) {
      return this.userMap.get(userID).name;
    } else {
      return '';
    }
  }

  public initCheckList() {
    this.checkedList = [];
  }

  public checkMinerInErrorStatus(pcID: number) {
    let minerStatus = '';
    if (this.pcIdNMinersMap.has(pcID)) {
      for (let miner of this.pcIdNMinersMap.get(pcID)) {
        minerStatus = miner.status;
      }
    }
    let isMinerStatusInError = minerErrorStatusList.indexOf(minerStatus) !== -1 ? true : false;
    return isMinerStatusInError;
  }

  public doReboot(id: number) {
    if (confirm('PC를 재부팅하시겠습니까?')) {
    } else {
      return;
    }
  }

  public changeStatus(id: number, status: string) {
    let actionStr = status === 'RUN' ? '시작' : '중지';
    if (confirm('PC를 ' + actionStr + '하시겠습니까?')) {
    } else {
      return;
    }
  }

  public doDeletePC(pcID: number) {
    const that = this;
    if (confirm('PC를 삭제하시겠습니까?')) {
    } else {
      return;
    }
  }

  public doRebootPlug(pcID: number) {
    alert('준비 중입니다.');
    // if (confirm('콘센트 재부팅하시겠습니까?')) {
    //   this.service.rebootPlugs([pcID], (res: any) => {
    //     this.onReload.emit();
    //     this.initData();
    //   }, (err: any) => {
    //     console.error(err);
    //   });
    // } else {
    //   return;
    // }
  }

  private initData() {
    let userIDs = new Set();
    this.selectedPcID = 0;
    this.beforeClicked = 0;
    this.pcIDList = [];
    // Get user list
    /*
    * minerList의 user id list를 userIDs set에 담아서 쿼리
    * */
    for (let miner of this.minerList) {
      userIDs.add(miner.user_id);
    }

    if (userIDs.size > 0) {
    }
  }
}
