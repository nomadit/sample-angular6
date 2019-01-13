import { Component, OnInit } from '@angular/core';
import { Service } from './service';
import { WindowRef } from '../../providers/window.ref';

@Component({
  selector: 'app-monitoring',
  templateUrl: './component.html',
  providers: [Service]
})

export class AdminComponent implements OnInit {
  public selectedRadio: string;
  public list: any[];

  private nativeWin: any;

  constructor(private service: Service,
              private winRef: WindowRef) {
    this.nativeWin = winRef.getNativeWindow();
  }

  public ngOnInit(): void {
    this.selectRadio('factory');
  }

  public selectRadio(radio: string) {
    this.selectedRadio = radio;
    this.changeList()
  }

  public getColumnByMenu() {
    switch (this.selectedRadio) {
      case 'wholesale':
        return '사업자';
      case 'retail':
        return '구매자';
      default:
        return '공장';
    }
  }

  public goUrl(item:any) {
    switch (this.selectedRadio) {
      case 'factory':
        this.service.getFactoryUserID(item.id).subscribe(id => {
          if (id === '') {
            alert('해당 공장의 관리자가 없습니다.')
          } else {
            this.nativeWin.open(this.nativeWin.location.href + '/admin/' + id, '_blank');
          }
        });
        break;
      case 'wholesale':
      case 'retail':
        this.nativeWin.open(this.nativeWin.location.href + '/admin/' + item.id, '_blank');
        break;
    }
  }

  private changeList() {
    switch (this.selectedRadio) {
      case 'factory':
        this.service.getFactorySummaryList().subscribe((map) => {
          this.list = [];
          map.forEach(value => {
            this.list.push(value)
          });
        });
        break;
      case 'wholesale':
        this.service.getWholesaleSummaryList().subscribe((map) => {
          this.list = [];
          map.forEach(value => {
            this.list.push(value)
          })
        });
        break;
      case 'retail':
        this.service.getRetailSummaryList().subscribe((map) => {
          this.list = [];
          map.forEach(value => {
            this.list.push(value)
          })
        });
        break;
    }
  }
}
