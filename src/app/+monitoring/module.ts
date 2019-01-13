import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MonitoringComponent } from './component';
import { HisModalComponent } from './customer/list/modal/his.modal/component';
import { PcModalComponent } from './customer/list/modal/pc.modal/component';
import { ChangeWalletModalComponent } from './customer/modal/change.wallet/component';
import { ChangeCoinModalComponent } from './customer/modal/change.coin/component';
import { AdminComponent } from './admin/component';
import { FactoryComponent } from './factory/pc/component';
import { FactoryPcListComponent } from './factory/pc/list/component';
import { FactoryPcModalPcInfoComponent } from './factory/_modal/pc-info/component';
import { FactoryMobileComponent } from './factory/mobile/component';
import { FactoryPcModalMinerErrorComponent } from './factory/_modal/miner-error/component';
import { FactoryPcModalComponent } from './factory/_modal/component';
import { WholesaleComponent } from './customer/wholesale/pc/component';
import { WholesaleMobileComponent } from './customer/wholesale/mobile/component';
import { RetailComponent } from './customer/retail/pc/component';
import { RetailMobileComponent } from './customer/retail/mobile/component';
import { PcListCustomerComponent } from './customer/list/pc/component';
import { PcListMobileComponent } from './customer/list/mobile/component';
import { CommonModule } from '@angular/common';
import { monitoringRouter } from './router';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { CheckPCIPListComponent } from './popup/ip-list/component';
import { ChangeFactoryModalComponent } from './factory/_modal/change.factory/component';
import { HeaderComponent } from './header/component';
import { TokenInterceptor } from '../providers/token.interceptor';
import { MonitoringService } from './service';
import { ContentParseToHashRate, GpusHashStringPipe } from './pipe';
import { BalanceComponent } from './customer/balance/component';
import { AdminMonitoringComponent } from './admin.component';
import { StatusClassDirective } from './directive/status-class.directive';
import { FixedHeaderDirective } from './directive/fixed-header.directive';
import { AssignCoinModalComponent } from './factory/_modal/assign.coin/component';

@NgModule({
  imports: [CommonModule, HttpClientModule, SharedModule.forRoot(), ModalModule.forRoot(), TooltipModule.forRoot(), monitoringRouter],
  declarations: [
    MonitoringComponent,
    AdminMonitoringComponent,
    HisModalComponent,
    PcModalComponent,
    PcListCustomerComponent,
    AdminComponent,
    WholesaleComponent,
    RetailComponent,
    FactoryComponent,
    FactoryMobileComponent,
    FactoryPcListComponent,
    FactoryPcModalComponent,
    FactoryPcModalMinerErrorComponent,
    FactoryPcModalPcInfoComponent,
    CheckPCIPListComponent,
    RetailMobileComponent,
    WholesaleMobileComponent,
    PcListMobileComponent,
    ChangeCoinModalComponent,
    ChangeWalletModalComponent,
    ChangeFactoryModalComponent,
    HeaderComponent,
    BalanceComponent,
    GpusHashStringPipe,
    ContentParseToHashRate,
    StatusClassDirective,
    FixedHeaderDirective,
    AssignCoinModalComponent
  ],
  entryComponents: [
    FactoryComponent,
    FactoryMobileComponent,
    AdminComponent,
    WholesaleComponent,
    HisModalComponent,
    PcModalComponent,
    RetailComponent,
    ChangeCoinModalComponent,
    ChangeWalletModalComponent,
    ChangeFactoryModalComponent,
    RetailMobileComponent,
    WholesaleMobileComponent,
    FactoryPcModalComponent,
    AssignCoinModalComponent
  ],
  exports: [MonitoringComponent],
  providers: [
    GpusHashStringPipe,
    ContentParseToHashRate,
    MonitoringService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ]
})
export class MonitoringModule {
  // constructor() {}
}
