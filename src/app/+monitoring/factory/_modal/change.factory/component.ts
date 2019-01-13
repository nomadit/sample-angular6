import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { PcService } from '../../../../providers/pc.service';
import { Subject } from 'rxjs';
import { FactoryService } from '../../../../providers/factory.service';

@Component({
  templateUrl: './component.html',
})

export class ChangeFactoryModalComponent implements OnInit {
  public factoryList: any[] = [];
  public pcIDList: any[] = [];
  public selectedFactoryID: number = -1;
  public pcListLength: number = 0;
  public onClose: Subject<boolean>;

  private isModified = false;

  private HTTP_STATUS_OK = 200;

  constructor(public bsModalRef: BsModalRef,
              private factoryService: FactoryService,
              private pcService: PcService) {
  }

  ngOnInit(): void {
    this.onClose = new Subject();
  }


  public setModal(pcIDList: any[]): void {
    // Set factory list
    this.factoryService.listAll().subscribe(list => {
      this.factoryList = list;
    });
    // Set pc id list
    this.pcIDList = pcIDList;
    // Add pc list length as confirm flag
    this.pcListLength = pcIDList.length;
  }

  public confirm() {
    if (this.selectedFactoryID < 1) {
      alert('공장을 선택해주세요.');
      return;
    }
    this.pcService.changeFactory(this.selectedFactoryID, this.pcIDList).subscribe((res) => {
      if ( res.status === this.HTTP_STATUS_OK) {
        alert('공장이 변경되었습니다.');
        this.isModified = true;
        this.close();
      } else {
        alert ('공장 변경 오류');
        return;
      }
    });
  }

  // Select factory at select box
  public selectFactory(id: number) {
    this.selectedFactoryID = id;
  }

  // Modal close
  public close() {
    this.onClose.next(this.isModified);
    this.bsModalRef.hide();
  }
}
