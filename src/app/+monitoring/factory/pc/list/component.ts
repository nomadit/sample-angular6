
import {map} from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FactoryPcModalComponent } from '../../_modal/component';
import { Service } from '../../service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { MinerErrorStatus } from '../../../const';

@Component({
  selector: 'factory-pc-list',
  templateUrl: './component.html',
})

export class FactoryPcListComponent implements OnChanges {
  @Input() public pcList: any[];
  @Input() public factoryList: any[];
  @Input() public selectedList: number[];
  @Input() public isSelectedAll: boolean;
  @Output() public toggleSelectedAll = new EventEmitter<void>();


  public minerStatMap: Map<number, any[]>;
  public minerGpuStatMap: Map<number, Map<number, any[]>>;
  public pcIdNMinersMap: Map<number, any[]>;
  public pcIDPlugMap: Map<number, any>;
  public pcIDGpuStatusMap: Map<number, any>;
  public thresholdMap: Map<number, any>;
  public factoryIDMap: Map<number, any>;
  public selectedPCIDForMultipleSelection;
  public bsModalRef: BsModalRef;

  constructor(private service: Service,
              private modalService: BsModalService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.pcList) {
      this.initData();
    }
  }

  protected initData() {
    this.selectedPCIDForMultipleSelection = 0;
    this.setIotPlugMap();
    this.setRebootCount();
    this.setGpuTypeNCount();
    this.setPcIdNMinersMap().subscribe(() => {
      this.setMinerStatus();
      this.setMinerHashStat();
      this.setMinerRestartCount();
      this.setMinerErrorCount();
    });
    this.setPcGpuStatusMap();
    this.setThresholdMap();
    this.setFactoryIDMap()
  }

  public updateCheckBox(id, event) {
    if (!event.shiftKey) {
      this.selectedPCIDForMultipleSelection = id;
      if (this.selectedList.indexOf(id) === -1) {
        this.selectedList.push(id);
        if (this.selectedList.length === this.pcList.length) {
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
      for (let pc of this.pcList) {
        selectedIDList.push(pc.id);
      }
      let temp = 0;
      let firstCheckedIndex: number = selectedIDList.indexOf(this.selectedPCIDForMultipleSelection);
      let lastCheckedIndex: number = selectedIDList.indexOf(id);
      if (firstCheckedIndex > lastCheckedIndex) {
        temp = firstCheckedIndex;
        firstCheckedIndex = lastCheckedIndex;
        lastCheckedIndex = temp;
      }
      let slicedIDListByIndexes: number[] = selectedIDList.slice(firstCheckedIndex, lastCheckedIndex + 1);
      for (let pcID of slicedIDListByIndexes) {
        if (this.selectedList.indexOf(pcID) === -1) {
          this.selectedList.push(pcID);
        }
      }
      if (this.selectedList.length === this.pcList.length) {
        this.toggleSelectedAll.emit();
      }// end jeKim
    }
  }

  public openPcPopup(item: any, type: string) {
    this.bsModalRef = this.modalService.show(FactoryPcModalComponent, {class: 'center-modal'});
    if (this.bsModalRef.content) {
      (<FactoryPcModalComponent> this.bsModalRef.content).setModal(item, this.pcIdNMinersMap.get(item.id), this.factoryList, type);
    } else {
      alert('잠시 기다려주세요.');
    }
  }

  public getGpuStat(minerID, gpuIdx) {
    if (this.minerGpuStatMap.has(minerID) && this.minerGpuStatMap.get(minerID).has(gpuIdx)) {
      const list = this.minerGpuStatMap.get(minerID).get(gpuIdx);
      let hash = '';
      let count = 1;
      for (const stat of list) {
        const obj = JSON.parse(stat.content);
        hash = hash + obj.hash_rate;
        if (list.length > 0 && count < list.length) {
          hash = hash + '<br>';
        }
        count++;
      }
      return hash;
    } else {
      return '-';
    }
  }

  public getGpuStatusTemp(pcID, gpuIdx) {
    if (this.pcIDGpuStatusMap.has(pcID) && this.pcIDGpuStatusMap.get(pcID).has(gpuIdx)) {
      return this.pcIDGpuStatusMap.get(pcID).get(gpuIdx).temp + ' ℃'
    } else {
      return '-'
    }
  }

  public getGpuStatusFan(pcID, gpuIdx) {
    if (this.pcIDGpuStatusMap.has(pcID) && this.pcIDGpuStatusMap.get(pcID).has(gpuIdx)) {
      return this.pcIDGpuStatusMap.get(pcID).get(gpuIdx).fan + ' %'
    } else {
      return '-'
    }
  }

  public setFactoryIDMap() {
    this.factoryIDMap = new Map();
    for (const factory of this.factoryList) {
      this.factoryIDMap.set(factory.id, factory)
    }
  }

  private setRebootCount() {
    this.service.getRebootCountMapByPcs(this.pcList).subscribe((map) => {
      for (const pc of this.pcList) {
        if (map.has(pc.id)) {
          pc.rebootCount = map.get(pc.id)
        } else {
          pc.rebootCount = 0;
        }
      }
    });
  }

  private setPcIdNMinersMap() {
    this.pcIdNMinersMap = new Map();
    return this.service.getMinersMapByPcs(this.pcList).pipe(map((map) => {
      this.pcIdNMinersMap = map;
      return;
    }));
  }

  private setMinerStatus() {
    for (const pc of this.pcList) {
      if (this.pcIdNMinersMap.has(pc.id)) {
        pc.minerStatus = this.pcIdNMinersMap.get(pc.id)[0].status;
      } else {
        pc.minerStatus = '';
      }
    }
  }

  private setMinerHashStat() {
    this.minerStatMap = new Map();
    this.minerGpuStatMap = new Map();
    this.service.getMinerIDNStatMapForDualByPcIDNMinersMap(this.pcIdNMinersMap).subscribe(map => {
      this.minerStatMap = map.statMap;
      this.minerGpuStatMap = map.gpuStatMap;
      this.minerGpuStatMap.forEach((value) => {
        value.forEach((val, gpuIdx) => {
          if (this.thresholdMap.has(val[0].pc_id) &&
            this.thresholdMap.get(val[0].pc_id).gpuMap &&
            this.thresholdMap.get(val[0].pc_id).gpuMap.has(gpuIdx)) {
            const obj = JSON.parse(val[0].content);
            if (obj.hash_rate < parseFloat(this.thresholdMap.get(val[0].pc_id).gpuMap.get(gpuIdx))) {
              val[0].status = MinerErrorStatus.HashRate;
            }
          }
        })
      })
    }, err => console.error(err));
  }

  private setThresholdMap() {
    this.thresholdMap = new Map();
    this.service.getThresholdMapByPCIDs(this.pcList).subscribe(map => {
      this.thresholdMap = map;
    }, err => console.error(err));
  }

  private setMinerRestartCount() {
    this.service.getRestartCountMapByPcMinerMap(this.pcIdNMinersMap).subscribe(map => {
      for (const pc of this.pcList) {
        if (map.has(pc.id)) {
          pc.minerRestartCount = map.get(pc.id)
        } else {
          pc.minerRestartCount = 0;
        }
      }
    }, err => console.error(err));
  }

  private setMinerErrorCount() {
    this.service.getErrorCountMapByPcMinerMap(this.pcIdNMinersMap).subscribe(map => {
      for (const pc of this.pcList) {
        if (map.has(pc.id)) {
          pc.minerErrorCount = map.get(pc.id)
        } else {
          pc.minerErrorCount = 0;
        }
      }
    }, err => console.error(err));
  }

  private setPcGpuStatusMap() {
    const pcMap = new Map();
    for (const pc of this.pcList) {
      if (pc.gpu) {
        pcMap.set(pc.id, pc)
      }
    }
    const factoryTempMap = new Map();
    for (const factory of this.factoryList) {
      if (factory.temp_threshold_json) {
        factoryTempMap.set(factory.id, JSON.parse(factory.temp_threshold_json))
      }
    }
    this.pcIDGpuStatusMap = new Map();
    this.service.getPcGpuStatusMap(this.pcList).subscribe(map => {
      map.forEach((value) => {
        value.forEach(stat => {
          stat.status = 'RUN';
          if (pcMap.has(stat.pc_id) && factoryTempMap.has(pcMap.get(stat.pc_id).factory_id)) {
            if (pcMap.get(stat.pc_id).gpu) {
              const gpuObj = JSON.parse(pcMap.get(stat.pc_id).gpu);
              if (gpuObj.NVIDIA_MINER > 0) {
                gpuObj.NVIDIA += gpuObj.NVIDIA_MINER;
              }
              if (gpuObj.NVIDIA > 0) {
                if (parseInt(stat.temp) > parseInt(factoryTempMap.get(pcMap.get(stat.pc_id).factory_id).NVIDIA)) {
                  stat.status = MinerErrorStatus.OverTemp;
                }
              } else if (gpuObj.AMD > 0) {
                if (parseInt(stat.temp) > parseInt(factoryTempMap.get(pcMap.get(stat.pc_id).factory_id).AMD)) {
                  stat.status = MinerErrorStatus.OverTemp;
                }
              }
            }
          }
        });
      });
      this.pcIDGpuStatusMap = map;
    }, err => {
      console.error(err);
    });
  }

  private setIotPlugMap() {
    this.pcIDPlugMap = new Map();
    this.service.getIotPlugMap(this.pcList).subscribe(map => {
      this.pcIDPlugMap = map;
    }, err => {
      console.error(err);
    });
  }

  private setGpuTypeNCount() {
    for (const pc of this.pcList) {
      let type = '-';
      let count = 0;
      let gpu = JSON.parse(pc.gpu);
      if (gpu.AMD && gpu.AMD > 0) {
        type = 'AMD';
        count += gpu.AMD;
      }
      if (gpu.NVIDIA && gpu.NVIDIA > 0) {
        type = 'NVIDIA';
        count += gpu.NVIDIA;
      }
      if (gpu.NVIDIA_MINER && gpu.NVIDIA_MINER > 0) {
        type = 'NVIDIA';
        count += gpu.NVIDIA_MINER;
      }
      pc.gpuType = type;
      pc.gpuCount = count > 0 ? count : '-';
    }
  }
}
