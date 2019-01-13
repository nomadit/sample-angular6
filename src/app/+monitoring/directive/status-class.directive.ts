import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { MinerErrorStatus } from '../const';

@Directive({
  selector: '[statusClass]'
})
export class StatusClassDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @Input('statusClass')
  public set statusClass(value: any) {
    if (!value) {
      return;
    }
    let status = '';
    if (value.type === 'td' || value.type === 'tr') {
      status = value.status;
    } else if (value.type === 'gpu' || value.type === 'temp') {
      if (value.map.has(value.id) && value.map.get(value.id).has(value.gpuIdx)) {
        if (value.type == 'gpu'){
          status = value.map.get(value.id).get(value.gpuIdx)[0].status;
        } else {
          status = value.map.get(value.id).get(value.gpuIdx).status;
        }
      }
    }
    if (value.type === 'td' || value.type === 'gpu' || value.type === 'temp'){
      switch (status) {
        case MinerErrorStatus.NoWorker:
          this.renderer.addClass(this.el.nativeElement, 'txt_clr_stop');
          break;
        case MinerErrorStatus.HashRate:
          this.renderer.addClass(this.el.nativeElement, 'txt_clr_down');
          break;
        case MinerErrorStatus.OverTemp:
          this.renderer.addClass(this.el.nativeElement, 'txt_clr_rise');
          break;
        default:
          this.renderer.removeClass(this.el.nativeElement, 'txt_clr_rise');
          this.renderer.removeClass(this.el.nativeElement, 'txt_clr_down');
          this.renderer.removeClass(this.el.nativeElement, 'txt_clr_stop');
      }
    } else if (value.type === 'tr') {
      switch (status) {
        case MinerErrorStatus.NoWorker:
          this.renderer.addClass(this.el.nativeElement, 'jequ_stop');
          break;
        case MinerErrorStatus.HashRate:
          this.renderer.addClass(this.el.nativeElement, 'jspd_down');
          break;
        case MinerErrorStatus.OverTemp:
          this.renderer.addClass(this.el.nativeElement, 'jtemp_rise');
          break;
        default:
          this.renderer.removeClass(this.el.nativeElement, 'jequ_stop');
          this.renderer.removeClass(this.el.nativeElement, 'jspd_down');
          this.renderer.removeClass(this.el.nativeElement, 'jtemp_rise');
      }
    }
  }
}
