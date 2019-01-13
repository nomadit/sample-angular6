import { Component, Input, OnInit } from '@angular/core';
import { FactoryPcModalService } from '../service';

@Component({
  selector: 'miner-error',
  templateUrl: './component.html',
  providers: [FactoryPcModalService]
})
export class FactoryPcModalMinerErrorComponent implements OnInit{
  @Input() public minerList: any[];
  public errorMsgList: any[];
  private regexForExtractErrorGpuNo = new RegExp(/[Gg][Pp][Uu] #?[0-9]\d?/g);
  constructor(private minerErrService: FactoryPcModalService) {
  }

  public ngOnInit(): void {
    this.getErrorMessageList();
  }

  public getTimeStamp(errorMsg: any) {
    if (!errorMsg) {
      return;
    }
    let timestamp = errorMsg['@timestamp'];
    return timestamp;
  }

  public extractErrorGpuNoByRegex(message: string) {
    return message.match(this.regexForExtractErrorGpuNo);
  }

  private getErrorMessageList() {
    this.errorMsgList = [];
    this.minerErrService.getErrorLogListByMinerID(this.minerList[0].id, (list) => {
      this.errorMsgList = list;
    });
  }
}
