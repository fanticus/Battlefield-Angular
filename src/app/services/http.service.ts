import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdvicesStateInterface } from '../store/state/advices.state';
import { ConfigStateInterface } from '../store/state/config.state';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  getShipsData(): Observable<ConfigStateInterface> {
    return this.http.get('/assets/configs.json');
  }

  getAdvicesData(): Observable<AdvicesStateInterface> {
    return this.http.get('/assets/advices.json');
  }
}
