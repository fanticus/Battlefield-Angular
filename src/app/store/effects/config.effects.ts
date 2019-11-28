import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  EnumConfigActions,
  GetConfigSuccess,
  GetConfig
} from '../actions/config.actions';
import { HttpService } from '../../services/http.service';
import { ConfigStateInterface } from '../state/config.state';

@Injectable()
export class ConfigEffects {
  @Effect()
  getConfig$ = this.actions$.pipe(
    ofType<GetConfig>(EnumConfigActions.GetConfig),
    switchMap(() => this.httpService.getShipsData()),
    switchMap((config: ConfigStateInterface) => of(new GetConfigSuccess(config)))
  );

  constructor(
    private httpService: HttpService,
    private actions$: Actions
  ) { }
}
