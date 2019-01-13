import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'popup',
  templateUrl: './component.html',
})
export class CheckPCIPListComponent implements OnInit{
  public pcList: any[];

  public ngOnInit(): void {
    console.log('ip-list/component init ...');
    this.pcList = window.opener.pcList;
  }

  public close() {
    window.close();
  }
}
