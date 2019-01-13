import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpRequest } from '@angular/common/http';

@Injectable()
export class HashService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  public getSampleCsvFile(id: number, factoryId: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('id', id.toString());
    params = params.append('factory_id', factoryId.toString());
    return this.http.get(process.env.JAVA_API_URL + '/api/download/sampleCsv/' + id, {params});
  }

  public getLastUploadCsvFile(id: number): Observable<any> {
    return this.http.get(process.env.JAVA_API_URL  + '/api/download/lastUploadFile/' + id);
  }

  public setUploadHashFile(formData: FormData): Observable<any> {
    let headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data',
    });
    return this.http.post(process.env.JAVA_API_URL + '/api/upload/massfile', formData, {headers});
  }
}
