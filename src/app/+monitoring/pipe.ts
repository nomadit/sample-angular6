import { Pipe, PipeTransform } from '@angular/core';
import { SecondCoinForETHClaymore } from '../shared/consts';

@Pipe({
  name: 'gpusHashString'
})
export class GpusHashStringPipe implements PipeTransform {
  transform(list: any[], args?: any): string {
    if (list == null) {
      return '';
    }
    let firstCoinStr = '', secondCoinStr = '';
    for (let item of list) {
      let content = JSON.parse(item.content);
      if (content.coin in SecondCoinForETHClaymore) {
        secondCoinStr += content.hash_rate.toFixed(3) + ' / ';
      } else {
        firstCoinStr += content.hash_rate.toFixed(3) + ' / ';
      }
    }
    let str = firstCoinStr;
    if (secondCoinStr.length > 0) {
      str += '<br>' + secondCoinStr
    }
    return str;
  }
}

@Pipe({
  name: 'contentParseToHashRate'
})
export class ContentParseToHashRate implements PipeTransform {
  transform(content: any, args?: any): any {
    return JSON.parse(content).hash_rate;
  }
}
