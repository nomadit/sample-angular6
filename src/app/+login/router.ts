import { RouterModule, Routes } from '@angular/router';
import { BlankComponent } from '../shared/layout/blank.component';
import { LoginComponent } from './login.component';

const LOGIN_ROUTER: Routes = [{
  path: '',
  component: BlankComponent,
  data: {title: 'main Views'},
  children: [{
      path: '', component: LoginComponent
    }]
}];

export const loginRouter = RouterModule.forChild(LOGIN_ROUTER);
