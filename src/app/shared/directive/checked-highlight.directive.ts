import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { MinerErrorStatus } from '../const';

@Directive({
  selector: '[checkedHighLight]'
})
export class CheckedHighlightDirective {
  constructor(private el: ElementRef,
              private renderer: Renderer2) {}

  @Input('checkedHighLight')
  public set checkedHightLight(value: any) {
    if (isNaN(value.checkedIndex)) {
      return;
    }
    if (value.status !== 'RUN' && value.status !== '') {
      return;
    }
    if (value.checkedIndex < 0 ) {
      this.renderer.removeClass(this.el.nativeElement, 'checked_highlight');
    } else {
      this.renderer.addClass(this.el.nativeElement, 'checked_highlight');
    }
  }
}
