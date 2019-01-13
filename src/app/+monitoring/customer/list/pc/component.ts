
import {forkJoin as observableForkJoin,  Observable } from 'rxjs';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PcModalComponent } from '../modal/pc.modal/component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Service } from '../service';

@Component({
  selector: 'pc-customer-list',
  templateUrl: './component.html',
  providers: [Service]
})
export class PcListCustomerComponent implements OnChanges {
  @Input() public minerList: any[];
  @Input() public selectedList: any[];
  @Input() public retailList: any[];
  @Input() public isSelectedAll: boolean;
  @Output() public toggleSelectedAll = new EventEmitter<void>();

  public pcMap: Map<number, any>;
  public minerStatMap: Map<number, any[]>;
  public factoryMap: Map<number, any>;
  public userMap: Map<number, any>;
  public bsModalRef: BsModalRef;
  public selectedPCIDForMultipleSelection: number;
  public isPreventedSecondCoin = false;

  // jeKim
  public userRole: string;
  private selectedIDForMultipleSelection: number;

  constructor(private service: Service,
              private modalService: BsModalService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.userMap === undefined) {
      this.userMap = new Map();
    }
    if (changes.minerList) {
      this.selectedPCIDForMultipleSelection = 0;
      this.service.getUserInfo().subscribe(me => {
        this.userRole = me.role === 'WHOLESALE' ? 'WHOLESALE' : 'RETAIL';
        this.userMap.set(parseInt(me.id), me);
        this.setMap();
        this.setRatioCoin();
      });
    }
    if (changes.retailList) {
      this.setUserMap();
    }
  }

  public updateCheckBox(id, event) {
    if (!event.shiftKey) {
      this.selectedIDForMultipleSelection = id;
      if (this.selectedList.indexOf(id) === -1) {
        this.selectedList.push(id);
        if (this.selectedList.length === this.minerList.length) {
          this.toggleSelectedAll.emit();
        }
      } else {
        const idx = this.selectedList.indexOf(id);
        this.selectedList.splice(idx, 1);
        if (this.isSelectedAll) {
          this.toggleSelectedAll.emit()
        }
      }
    } else { // jeKim
      let selectedIDList: any[] = [];
      for (let miner of this.minerList) {
        selectedIDList.push(miner.id);
      }
      let temp = 0;
      let firstCheckedIndex: number = selectedIDList.indexOf(this.selectedIDForMultipleSelection);
      let lastCheckedIndex: number = selectedIDList.indexOf(id);
      if (firstCheckedIndex > lastCheckedIndex) {
        temp = firstCheckedIndex;
        firstCheckedIndex = lastCheckedIndex;
        lastCheckedIndex = temp;
      }
      let slicedIDListByIndexes: number[] = selectedIDList.slice(firstCheckedIndex, lastCheckedIndex + 1);
      for (let minerID of slicedIDListByIndexes) {
        if (this.selectedList.indexOf(minerID) === -1) {
          this.selectedList.push(minerID);
        }
      }
      if (this.selectedList.length === this.minerList.length) {
        this.toggleSelectedAll.emit();
      }// end jeKim
    }
  }

  public openPcPopup(miner: any) {
    this.bsModalRef = this.modalService.show(PcModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<PcModalComponent> this.bsModalRef.content).setModal(this.pcMap.get(miner.pc_id), [miner]);
    } else {
      alert('잠시 기다려주세요.');
    }
  }

  private setRatioCoin() {
    if (this.userMap.size === 1) {
      this.userMap.forEach(value => {
        if (value.user_has_user && value.user_has_user.has_second_coin === 0){
          this.isPreventedSecondCoin = true;
        }
      })
    }
    const ids = [];
    for(const miner of this.minerList) {
      ids.push(miner.id)
    }
    this.service.getMinerCommandMap(ids).subscribe(map => {
      for(const miner of this.minerList) {
        if (map.has(miner.id)) {
          if (map.get(miner.id).dual_ratio === null || map.get(miner.id).dual_ratio === 0 || this.isPreventedSecondCoin) {
            miner.ratioStr = '100';
          } else {
            miner.ratioStr = (100 - map.get(miner.id).dual_ratio) + ' : ' + map.get(miner.id).dual_ratio;
          }
        } else {
          miner.ratioStr = '';
        }
        const coinObj = JSON.parse(miner.coin);
        if (this.isPreventedSecondCoin || coinObj.sub === null) {
          miner.coinStr = coinObj.main
        } else {
          miner.coinStr = coinObj.main + '<br>' + coinObj.sub;
        }
      }
    });
  }

  private setUserMap() {
    for (const user of this.retailList) {
      this.userMap.set(user.id, user);
    }
  }

  private setMap() {
    const pcIDSet = new Set<number>();
    const factoryIDSet = new Set<number>();
    const minerIDs = [];
    for (const miner of this.minerList) {
      pcIDSet.add(miner.pc_id);
      factoryIDSet.add(miner.factory_id);
      minerIDs.push(miner.id);
    }
    this.pcMap = new Map();
    this.factoryMap = new Map();
    this.minerStatMap = new Map();
    const getPcMap = this.service.getPcMap(pcIDSet);
    const getFactoryMapByIDs = this.service.getFactoryMapByIDs(factoryIDSet);
    const getMinerIDNStatMapForDual = this.service.getMinerIDNStatMapForDual(minerIDs);
    observableForkJoin(getPcMap, getFactoryMapByIDs, getMinerIDNStatMapForDual).subscribe(res => {
      this.pcMap = res[0];
      this.factoryMap = res[1];
      this.minerStatMap = res[2];
      }, err => console.error(err));
  }
}
