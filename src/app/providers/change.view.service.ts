import { Injectable } from '@angular/core';

@Injectable()
export class ChangeViewService {
  private viewType: string  = '';

  public getViewType(): string {
    if (this.viewType.length > 0) {
      return this.viewType;
    }
    let ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      this.viewType = 'mobile';
    } else {
      this.viewType = 'pc';
    }
    return this.viewType;
  }
}
