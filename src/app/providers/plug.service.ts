import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class PlugService {
  constructor(private http: HttpClient) {
  }

  public reboots(ids: number[]): Observable<any> {
    let params = new HttpParams();
    ids.forEach((id) => {
      params = params.append('id', id.toString());
    });
    return this.http.get<any>(process.env.API_URL + '/api/plug/reboot/by_pc_ids', {params});
  }
}
