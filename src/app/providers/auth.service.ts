
import {of as observableOf,  Observable } from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  private isCheckedPasswordAtAccount = false;
  private token: string;
  private jwtHelper: JwtHelperService;
  private isSubstitution = false;
  private substituteMap: any;
  private substituteID = 0;

  constructor(private http: HttpClient,
              private user: UserService) {
    this.jwtHelper = new JwtHelperService();
  }

  public login(username: string, password: string): Observable<boolean> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return this.http.post(process.env.API_URL + '/api/user/login', JSON.stringify({
        username,
        password
      }), {headers}).pipe(
      map((res: any) => {
        let token = res && res.token;
        if (token) {
          this.token = token;
          localStorage.setItem('currentUser', JSON.stringify({username, token}));
          const info = this.jwtHelper.decodeToken(this.token);
          if (info.role === 'ADMIN') {
            delete info.password;
            delete info.created_at;
            delete info.deleted_at;
            delete info.updated_at;
            delete info.exp;
            localStorage.setItem('adminInfo', JSON.stringify({username, info}));
            this.delayAdminExpire()
          }
          return true;
        } else {
          return false;
        }
      }));
  }

  public checkPassword(password: string): Promise<any> {
    return this.http.post(process.env.API_URL + '/api/user/check_password', JSON.stringify({
      password
    })).toPromise();
  }

  public logout(): void {
    this.token = null;
    this.isSubstitution = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('substitute');
    this.isCheckedPasswordAtAccount = false;
  }

  /*
    id: item.id,
    login_id: item.login_id,
    name: item.name,
    mobile_num: item.mobile_num,
    email: item.email,
    info: item.info,
    role: item.role
   */
  public getInfo(): any {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    if (this.token) {
      const info = this.jwtHelper.decodeToken(this.token);
      if (info.role === 'RETAIL' && !info.user_has_user ) {
        alert('정보 갱신이 필요합니다. 다시 로그인 해주세요.');
        this.logout();
      } else {
        return info;
      }
    } else {
      return;
    }
  }

  public hasSubstitution() {
    return this.isSubstitution;
  }

  public getInfoForMonitoring(): Observable<any> {
    if (this.isSubstitution) {
      return this.getSubstitute(this.substituteID);
    } else {
      return observableOf(this.getInfo());
    }
  }

  public getAdminInfo(): any {
    this.isSubstitution = true;
    return JSON.parse(localStorage.getItem('adminInfo'));
  }

  public setSubstitution(user: any) {
    delete user.password;
    delete user.created_at;
    delete user.deleted_at;
    delete user.updated_at;
    this.substituteMap = JSON.parse(localStorage.getItem('substitute'));
    if (!this.substituteMap) {
      this.substituteMap = {};
    }
    this.substituteMap[user.id] = user;
    localStorage.setItem('substitute', JSON.stringify(this.substituteMap));
  }

  public getSubstitute(id: number) {
    this.substituteID = id;
    this.substituteMap = JSON.parse(localStorage.getItem('substitute'));
    if (this.substituteMap &&
      Object.keys(this.substituteMap).length > 0 &&
      Object.keys(this.substituteMap).indexOf(this.substituteID.toString()) > -1) {
      return observableOf(this.substituteMap[this.substituteID]);
    } else {
      return this.user.getItemByID(this.substituteID).pipe(map((item:any) => {
        this.setSubstitution(item);
        return this.substituteMap[this.substituteID];
      }));
    }
  }

  public getRole(): string {
    return this.getInfo().role;
  }

  public getToken(): string {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    return this.token;
  }

  public getCheckedPassword() {
    const currentRole = this.getRole();
    if (currentRole === 'ADMIN' || this.isCheckedPasswordAtAccount) {
      return true;
    }
    return false;
  }

  public delayAdminExpire() {
    let admin = this.getAdminInfo();
    admin.info.exp = moment(new Date()).add(30, 'm').toDate();
    localStorage.setItem('adminInfo', JSON.stringify({username: admin.username, info: admin.info}));
  }

  public isAdminExpire() {
    const now = new Date().getTime();
    let admin = this.getAdminInfo();
    if (now > new Date(admin.info.exp).getTime()) {
      return true;
    }
    return false;
  }

  public setCheckedPassword(isValid: boolean) {
    this.isCheckedPasswordAtAccount = isValid;
  }

}
