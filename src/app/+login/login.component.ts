import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  public model: any = {};
  public returnUrl: string;
  public errorMsg: string = '';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService) {
  }

  public ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.checkAuth();
  }

  public checkAuth() {
    if (localStorage.getItem('currentUser')) {
      this.router.navigate([this.returnUrl]);
    }
  }

  public login() {
    this.errorMsg = '';
    if (this.model.login_id.length === 0 || this.model.password.length === 0) {
      this.errorMsg = '*아이디와 비밀번호를 모두 입력해주세요.';
      return;
    }
    this.authService.login(this.model.login_id, this.model.password).subscribe(() => {
      this.router.navigateByUrl(this.returnUrl);
    },
    (error: any) => {
      if (error.status === 401 || error.status === 403) {
        this.model.password = '';
      }
      this.errorMsg = '*아이디 또는 비밀번호가 틀렸습니다. 다시 입력해주세요.';
    });
  }
}
