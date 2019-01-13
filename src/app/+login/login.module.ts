import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { AuthService } from '../providers/auth.service';
import { AlertModule } from 'ngx-bootstrap';
import { loginRouter } from './router';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [CommonModule, FormsModule, loginRouter, AlertModule.forRoot(), SharedModule.forRoot()],
  declarations: [LoginComponent],
  exports: [LoginComponent],
  providers: [
    AuthService
  ]
})
export class LoginModule { }
