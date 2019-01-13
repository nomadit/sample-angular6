import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EventEmitter } from '@angular/core';

/**
 * This class represents the navigation bar component.
 */
@Component({
  selector: 'm-pagination',
  templateUrl: 'component.html',
})
export class PaginationComponent implements OnChanges {
  @Input() public page: any;
  @Output() public getPage = new EventEmitter<number>();
  public pages: any[] = [];
  public lastPageNum;

  constructor() {
    this.page = {
      pageNum: 0,
      perPage: 0,
      totalCount: 0
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pages = this.getPageList();
  }

  public movePage(pageNum: number) {
    if (this.page.pageNum !== pageNum && pageNum > 0 && pageNum <= this.lastPageNum) {
      this.getPage.emit(pageNum);
    }
  }

  private getPageList() {
    if (!this.page) {
      return;
    }
    if ((this.page.pageNum > 0 && (this.page.pageNum - 1) * this.page.perPage > this.page.totalCount) || this.page.pageNum < 1) {
      return;
    }

    const maxVisibleSize: number = 10;
    const leftVisibleSize: number = 4;
    let firstNumberOfRange: number;
    let lastNumberOfRange: number;

    this.lastPageNum = Math.ceil(this.page.totalCount / this.page.perPage);
    firstNumberOfRange = this.page.pageNum - leftVisibleSize;
    if (firstNumberOfRange < 1) {
      firstNumberOfRange = 1;
    } else if (this.lastPageNum > maxVisibleSize && firstNumberOfRange > this.lastPageNum - maxVisibleSize) {
      firstNumberOfRange = this.lastPageNum - maxVisibleSize;
    }
    lastNumberOfRange = firstNumberOfRange  + maxVisibleSize;
    if (lastNumberOfRange > this.lastPageNum) {
      lastNumberOfRange = this.lastPageNum;
    }

    let pages: number[] =  [];
    // 첫번째, 마지막 페이지 인덱스 기준으로 페이징 리스트에 인덱스 추가
    for (let i = firstNumberOfRange; i <= lastNumberOfRange; i++) {
      pages.push(i);
    }
    return pages;
  }

} // end of  class
