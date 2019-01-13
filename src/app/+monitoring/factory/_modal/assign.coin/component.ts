import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { FactoryPcModalService } from '../service';

@Component({
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  providers: [FactoryPcModalService]
})

export class AssignCoinModalComponent implements OnInit {
  public coinList: any[] = [];
  public assignedCoinList: any[] = [];
  public pcList: any[] = [];
  public coinCountMap = new Map<string, number>();
  public onClose: Subject<boolean>;

  private pcIDList: any[] = [];
  private isModified = false;

  constructor(public bsModalRef: BsModalRef,
              private service: FactoryPcModalService) {
  }

  ngOnInit(): void {
    this.onClose = new Subject();
  }

  public setModal(pcIDList: number[]): void {
    this.pcIDList = Array.from(pcIDList);
    this.service.getPcList(pcIDList).subscribe(res => {
      this.pcList = res;
    }, err => {
      console.error(err)
    });
    this.service.getPoolList().subscribe(res => {
      let coinSet = new Set();
      for (let item of res) {
        coinSet.add(item.coin);
      }
      let allCoins = [];
      coinSet.forEach(coin => {
        allCoins.push(coin)
      });
      this.service.getPcCoinList(pcIDList).subscribe(res => {
        let pcCoinSet = new Set();
        for (let key in res) {
          for (let item of res[key]) {
            pcCoinSet.add(item.coin);
            if (!this.coinCountMap.has(item.coin)) {
              this.coinCountMap.set(item.coin, 0)
            }
            let count = this.coinCountMap.get(item.coin);
            count++;
            this.coinCountMap.set(item.coin, count)
          }
        }
        pcCoinSet.forEach(coin => {
          this.assignedCoinList.push(coin);
          allCoins.splice(allCoins.indexOf(coin), 1);
        });
        this.coinList = Array.from(allCoins);
      }, err => {
        console.error(err)
      });
    }, err => {
      console.error(err)
    });
  }

  public confirm() {
    if (!confirm('적용하겠습니까?')) {
      return;
    }
    this.service.assignCoin(this.pcIDList, this.assignedCoinList).subscribe(res => {
      alert('저장하였습니다.');
      this.isModified = true;
      this.close();
    }, err => {
      alert('실패했습니다.');
      console.log(err)
    })
  }

  public selectCoin(coin: string) {
    this.coinList.splice(this.coinList.indexOf(coin), 1);
    this.assignedCoinList.push(coin);
    this.coinCountMap.set(coin, this.pcIDList.length);
  }

  // Select factory at select box
  public deleteItem(coin: string) {
    this.assignedCoinList.splice(this.assignedCoinList.indexOf(coin), 1);
    this.coinList.push(coin);
  }

  // Modal close
  public close() {
    this.onClose.next(this.isModified);
    this.bsModalRef.hide();
  }
}
