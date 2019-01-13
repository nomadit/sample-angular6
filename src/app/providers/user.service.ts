import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {
  }

  public listFactoryByUserId(id: number): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/user/list/has_factory/by_user/' + id);
  }

  public mapRetailListByWholesaleIDs(ids: any[]): Observable<any> {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/user/map/retail/list/by_wholesale_ids', {params});
  }

  public createWholesaleAccount(accountInfo: any): Observable<any> {
    return this.http.post(process.env.API_URL + '/api/user/wholesale', JSON.stringify(accountInfo));
  }

  public createRetailAccountByWholesaleID(accountInfo: any, wholesaleID: number): Observable<any> {
    return this.http.post(process.env.API_URL + '/api/user/retail/' + wholesaleID, JSON.stringify(accountInfo));
  }

  public resetPasswordByUserID(userID: number): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/user/reset/password/' + userID, {});
  }

  public deleteFactoryAccountByUserID(userID: number): Observable<any> {
    return this.http.delete(process.env.API_URL + '/api/user/in_factory/' + userID);
  }

  public changePasswordByUserID(userInfo: any, userID: number): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/user/change/password/' + userID,
      JSON.stringify(userInfo));
  }

  public changeUserItemByUserID(userInfo: any, userID: number): Observable<any> {
    return this.http.put(process.env.API_URL + '/api/user/item/' + userID,
      JSON.stringify(userInfo));
  }

  public checkPassword(currentPassword: string): Observable<any> {
    return this.http.post(process.env.API_URL + '/api/user/check_password', {
      password: currentPassword
    });
  }

  public getListByLoginIDWithRole(keyword: string, role: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('keyword', keyword);
    params = params.append('role', role);
    return this.http.get(process.env.API_URL + '/api/user/search/by_login_id/with_role', {params});
  }

  public getRetailCntMapByWholesaleIDs(wholesaleIDs): Observable<any> {
    let params = new HttpParams();
    for (let id of wholesaleIDs) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/user/map/count/has_user/by_parent_ids', {params});
  }

  public getHasUser(userID): Observable<any> {
    return this.http.get(process.env.API_URL + '/api/user/has_user/item/' + userID);
  }

  public getItemByID(userID: number): Observable<any> {
    return this.http.get(process.env.API_URL + '/api/user/item/' + userID);
  }

  public hisListForInfo(id: number): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/user/his/info/list/' + id);
  }
  public hisListForWallet(id: number): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/wallet/his/list/by_user_id/' + id);
  }

  public getRetailListByWholesaleID(wholesaleID: number): Observable<any> {
    return this.http.get(process.env.API_URL + '/api/user/retail/list/by_wholesale_id/' + wholesaleID);
  }
}
