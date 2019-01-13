import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { MainComponent } from './layout/main.component';
import { BlankComponent } from './layout/blank.component';
import { PaginationComponent } from './pagination/component';
import { DisplayMinerStatusPipe } from './pipe/miner_status';
import { HashSumPipe } from './pipe/hash_sum';
import { CheckedHighlightDirective } from './directive/checked-highlight.directive';

/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule],
  declarations: [
    NavbarComponent,
    MainComponent,
    PaginationComponent,
    BlankComponent,
    DisplayMinerStatusPipe,
    HashSumPipe,
    CheckedHighlightDirective,
  ],
  exports: [
    NavbarComponent,
    MainComponent,
    BlankComponent,
    CommonModule,
    PaginationComponent,
    FormsModule,
    RouterModule,
    DisplayMinerStatusPipe,
    HashSumPipe,
    CheckedHighlightDirective,
  ],
  providers: []
})
export class SharedModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
