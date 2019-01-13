import { Injectable } from '@angular/core';
import { SecondCoinForETHClaymore } from '../shared/consts';

@Injectable()
export class UtilService  {

  public sortListAscByGpuIdx(list: any[]) {
    list = list.sort((a, b) => {
      let sortingIndex = a.GPU_IDX ? 'GPU_IDX' : 'idx';
      if (parseInt(a[sortingIndex]) > parseInt(b[sortingIndex])) {
        return 1;
      }
      if (parseInt(a[sortingIndex]) < parseInt(b[sortingIndex])) {
        return -1;
      }
      return 0;
    });
    return list;
  }

  public getTotalCoinSum(list: any[]) {
    let totalCoinSum = new Map<string, number>();
    for (let item of list) {
      let content = JSON.parse(item.content);
      if (!totalCoinSum.has(item.coin)) {
        totalCoinSum.set(item.coin, content.hash_rate);
      } else {
        let sum = totalCoinSum.get(item.coin);
        sum += content.hash_rate;
        totalCoinSum.set(item.coin, sum);
      }
    }
    let firstCoinHash = 0.0;
    let secondCoinHash = 0.0;
    totalCoinSum.forEach((sum, coin) => {
      if (coin in SecondCoinForETHClaymore) {
        secondCoinHash = sum;
      } else {
        firstCoinHash = sum;
      }
    });
    return {mainCoin: firstCoinHash, subCoin: secondCoinHash};
  }
}
