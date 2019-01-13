import { Routes } from '@angular/router';
import { _404Component } from './error.page/_404/component';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'monitoring',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: './+login/login.module#LoginModule'
  },
  {
    path: 'monitoring',
    loadChildren: './+monitoring/module#MonitoringModule'
  },
  {
    path: '**',
    component: _404Component
  },
];

