import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PoolService {
  constructor(private http: HttpClient) {
  }

  public getListAll(): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/pool/list');
  }
}
