import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/*
 * Platform and Environment providers/directives/pipes
 */
import { environment } from 'environments/environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';

import { AuthGuard } from './providers/auth.guard';
import { AuthService } from './providers/auth.service';
import { FactoryService } from './providers/factory.service';
import { MinerService } from './providers/miner.service';
import { PcService } from './providers/pc.service';
import { PlugService } from './providers/plug.service';
import { TokenInterceptor } from './providers/token.interceptor';
import { UserService } from './providers/user.service';
import { WalletService } from './providers/wallet.service';
import { ChangeViewService } from './providers/change.view.service';
import { PoolService } from './providers/pool.service';
import { HashService } from './providers/hash.service';
import { MinerCommandService } from './providers/miner-command.service';
import { WindowRef } from './providers/window.ref';
import { _404Component } from './error.page/_404/component';
import { UtilService } from './providers/util.service';
// import { CoinOrderService } from './providers/coin-order.service';

import '../assets/css/style.css';
import '../assets/css/content.css';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthGuard,
  AuthService,
  FactoryService,
  MinerService,
  MinerCommandService,
  PcService,
  PoolService,
  PlugService,
  UserService,
  WalletService,
  ChangeViewService,
  HashService,
  UtilService,
  // CoinOrderService,
  WindowRef,
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    _404Component,
  ],
  /**
   * Import Angular's modules.
   */
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES, {
      useHash: Boolean(history.pushState) === false,
      preloadingStrategy: PreloadAllModules
    }),
  ],
  /**
   * Expose our Services and Providers into Angular's dependency injection.
   */
  providers: [
    environment.ENV_PROVIDERS,
    APP_PROVIDERS,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
  ]
})
export class AppModule { }
