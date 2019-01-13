import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from '../shared/layout/main.component';
import { BlankComponent } from '../shared/layout/blank.component';
import { AuthGuard } from '../providers/auth.guard';
import { MonitoringComponent } from './component';
import { CheckPCIPListComponent } from './popup/ip-list/component';
import { AdminMonitoringComponent } from './admin.component';

const MONITORING_ROUTER: Routes = [
  {
  path: '',
  component: MainComponent,
  data: {title: 'main Views'},
  children: [
      {path: '', component: MonitoringComponent, canActivate: [AuthGuard]}
    ]
  },
  {
    path: 'ip_list',
    component: BlankComponent,
    data: {title: 'IP List'},
    children: [
      {path: '', component: CheckPCIPListComponent, canActivate: [AuthGuard]}
    ]
  },
  {
    path: 'admin/:id',
    component: MainComponent,
    data: {title: 'main Views'},
    children: [
      {path: '', component: AdminMonitoringComponent, canActivate: [AuthGuard]}
    ]
  },
];

export const monitoringRouter = RouterModule.forChild(MONITORING_ROUTER);
