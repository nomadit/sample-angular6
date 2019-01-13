
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class FactoryService {
  private factoryMap: Map<number, any> = new Map();

  constructor(private http: HttpClient) {
  }

  public listAll(): Observable<any[]> {
    return this.http.get<any[]>(process.env.API_URL + '/api/factory/list');
  }

  public getByID(id: number): Observable<any> {
    if (this.factoryMap.has(id)) {
      return this.factoryMap.get(id);
    } else {
      return this.http.get(process.env.API_URL + '/api/factory/item/' + id);
    }
  }

  public getListByIDs(idSet: Set<number>): Observable<any> {
    let params = new HttpParams();
    idSet.forEach((value) => {
      params = params.append('id', value.toString());
    });
    return this.http.get(process.env.API_URL + '/api/factory/list/by_ids', {params});
  }

  // TODO Func name
  public getListByIDsOnJava(idSet: Set<number>): Observable<any> {
    let params = new HttpParams();
    idSet.forEach((value) => {
      params = params.append('id', value.toString());
    });
    return this.http.get(process.env.JAVA_API_URL + '/api/factory/list/by_ids', {params});
  }

  public changeFactoryTempThreasholdByFactoryID(factoryID: number, factoryInfo: any) {
    return this.http.put<any>(process.env.JAVA_API_URL + '/api/factory/temp_threshold/' + factoryID, JSON.stringify(factoryInfo));
  }
}
