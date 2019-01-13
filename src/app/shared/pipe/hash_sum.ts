import { Pipe, PipeTransform } from '@angular/core';
import { UtilService } from '../../providers/util.service';

@Pipe({
  name: 'hashSum'
})
export class HashSumPipe implements PipeTransform {
  constructor(private utilService: UtilService) {}
  transform(list: any[], args: boolean): string {
    if (list == null) {
      return '';
    }
    let isPreventedSecondCoin = false;
    if (args) {
      isPreventedSecondCoin = args;
    }
    const totalCoinSum = this.utilService.getTotalCoinSum(list);
    if (totalCoinSum.mainCoin === 0.0) {
      return '-';
    } else {
      let sumStr = totalCoinSum.mainCoin.toFixed(3);
      if (totalCoinSum.subCoin > 0 && isPreventedSecondCoin === false) {
        sumStr += '<br>' + totalCoinSum.subCoin.toFixed(3);
      }
      return sumStr;
    }
  }
}



