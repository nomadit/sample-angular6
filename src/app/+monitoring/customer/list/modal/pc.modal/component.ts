import { Component, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FactoryService } from '../../../../../providers/factory.service';
import { AuthService } from '../../../../../providers/auth.service';
import { Service } from './service';
import { SecondCoinForETHClaymore } from '../../../../../shared/consts';

@Component({
  selector: 'modal-content',
  templateUrl: './component.html',
  providers: [Service]
})
export class PcModalComponent {
  @Output() public onReload = new EventEmitter<void>();
  public minerList: any[];
  public minerIDStatMap: Map<number, any[]>;
  public minerIDDualStatMap: Map<number, any>;
  public factoryName: string = '';
  public role: string = '';
  public pcModel: any = {
    hostname: '',
    mac_address: '',
    access_ip: '',
    ip_address: '',
  };

  constructor(public bsModalRef: BsModalRef,
              private service: Service,
              private factory: FactoryService,
              private auth: AuthService) {
  }

  public setModal(pc: any, minerList: any[]): void {
    this.minerIDStatMap = new Map();
    this.minerIDDualStatMap = new Map();
    this.minerList = minerList;
    this.pcModel = pc;
    this.auth.getInfoForMonitoring().subscribe(info => this.role = info.role);
    this.factory.getByID(this.pcModel.factory_id).subscribe((item) => {
      this.factoryName = item.name;
    });
    // Get miner map
    let ids: number[] = [];
    for (let item of minerList) {
      ids.push(item.id);
    }
    this.service.getStatMap(ids).subscribe((map) => {
      this.minerIDStatMap = map;
      map.forEach((list, key) => {
        for (let item of list) {
          if (!this.minerIDDualStatMap.has(key)) {
            this.minerIDDualStatMap.set(key, {first: [], second: []})
          }
          if (item.coin in SecondCoinForETHClaymore) {
            this.minerIDDualStatMap.get(key).second.push(item)
          } else {
            this.minerIDDualStatMap.get(key).first.push(item)
          }
        }
      });
    });
  }

  public getGpuType(pcModel) {
    let gpuType: string = '';
    if (pcModel) {
      let gpu = pcModel.gpu;
      let gpuObj = JSON.parse(gpu);
      if (gpuObj.AMD && gpuObj.AMD > 0) {
        gpuType = 'AMD';
      } else if (gpuObj.NVIDIA && gpuObj.NVIDIA > 0) {
        gpuType = 'NVIDIA';
      } else if (gpuObj.NVIDIA_MINER && gpuObj.NVIDIA_MINER > 0) {
        gpuType = 'NVIDIA_MINER';
      } else {
        gpuType = '';
      }
    }
    return gpuType;
  }

  // Modal close
  public close() {
    this.bsModalRef.hide();
  }
}
