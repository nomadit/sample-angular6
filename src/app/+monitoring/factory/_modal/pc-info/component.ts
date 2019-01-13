import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FactoryPcModalService } from '../service';

@Component({
  selector: 'pc-info',
  templateUrl: './component.html',
  providers: [FactoryPcModalService]
})
export class FactoryPcModalPcInfoComponent implements OnInit {
  @Input() public pcModel: any;
  @Input() public minerList: any[];
  public totalMainCoinHashMap: Map<number, string>;
  public totalSubCoinHashMap: Map<number, string>;

  constructor(public bsModalRef: BsModalRef,
              private service: FactoryPcModalService) {
  }

  public ngOnInit() {
    this.getMinerStatMap();
  }

  public getGpuType(pcModel) {
    if (!pcModel) {
      return;
    }
    let gpuType: string = '';
    let pcGPU = JSON.parse(pcModel.gpu);
    if (pcGPU.AMD && pcGPU.AMD > 0) {
      gpuType = 'AMD';
    } else if (pcGPU.NVIDIA && pcGPU.NVIDIA > 0) {
      gpuType = 'NVIDIA';
    } else if (pcGPU.NVIDIA_MINER && pcGPU.NVIDIA_MINER > 0) {
      gpuType = 'NVIDIA_MINER';
    } else {
      gpuType = '';
    }
    return gpuType;
  }

  private getMinerStatMap() {
    if (this.minerList.length === 0) {
      return;
    }
    let ids = [];
    for (let miner of this.minerList) {
      ids.push(miner.id);
    }
    this.totalMainCoinHashMap = new Map();
    this.totalSubCoinHashMap = new Map();
    this.service.getStatMap(ids).subscribe((map) => {
      for(const miner of this.minerList) {
        if (map.has(miner.id)) {
          const totalCoinSum = this.service.getTotalCoin(map.get(miner.id));
          if (totalCoinSum.mainCoin === 0) {
            this.totalMainCoinHashMap.set(miner.id, '-')
          } else {
            this.totalMainCoinHashMap.set(miner.id, totalCoinSum.mainCoin.toFixed(3))
          }
          if (totalCoinSum.subCoin > 0) {
            this.totalSubCoinHashMap.set(miner.id, totalCoinSum.subCoin.toFixed(3))
          }
        }
      }
    });
  }
}
