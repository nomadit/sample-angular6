import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BalanceService } from './service';
import { Concurrency } from '../../../shared/config/const';

@Component({
  selector: 'customer-balance',
  templateUrl: 'component.html',
  providers: [BalanceService]
})
export class BalanceComponent implements OnChanges {
  @Input() public userID: number;
  public coinSummationMap: Map<string, any>;
  public concurrencyInfo = Concurrency;
  public coinList: string[];
  public error: string;

  constructor(private balanceService: BalanceService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.userID) {
      this.error = '';
      this.coinList = [];
      this.coinSummationMap = new Map();
      this.getCoinSummationMap();
      this.subscribeCoinSummationError();
    }
  }

  public getFixedNum(balance: number) {
    return balance.toFixed(8);
  }

  private getCoinSummationMap() {
    this.balanceService.getCoinSummationMap(this.userID).subscribe((map) => {
      if (!map) {
        return;
      }
      map.then((res) => {
        this.coinSummationMap = res;
        this.coinSummationMap.forEach((key, value) => {
          this.coinList.push(value);
        });
      });
    });
  }

  private subscribeCoinSummationError() {
    this.balanceService.error.subscribe((error) => {
      this.error = error;
    });
  }
}
