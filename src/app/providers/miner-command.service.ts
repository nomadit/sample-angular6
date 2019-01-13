
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class MinerCommandService {
  constructor(private http: HttpClient, private auth: AuthService) {
  }

  public getMinerIDCommandMapByMinerIDs(ids:number[]): Observable<Map<number, any>> {
    let params = new HttpParams();
    for (let id of ids) {
      params = params.append('id', id.toString());
    }
    return this.http.get(process.env.API_URL + '/api/miner_command/list/by_miner_ids', {params}).pipe(map((list:any[]) => {
      const map = new Map<number, any>();
      for (const command of list) {
        map.set(command.miner_id, command)
      }
      return map;
    }));
  }
}
