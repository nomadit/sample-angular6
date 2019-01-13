import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[fixedHeader]'
})
export class FixedHeaderDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2) {
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    let offSetTop = 0;
    if (this.el.nativeElement.offsettop !== 0) {
      offSetTop = this.el.nativeElement.offsetTop + 100;
    }
    if (window.pageYOffset > offSetTop) {
      this.renderer.addClass(this.el.nativeElement, 'sticky');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'sticky');
    }
  }
}
