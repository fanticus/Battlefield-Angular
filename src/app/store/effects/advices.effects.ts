import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  EnumAdvicesActions,
  GetAdvicesSuccess,
  GetAdvices
} from '../actions/advices.actions';
import { HttpService } from '../../services/http.service';
import { AdvicesStateInterface } from '../state/advices.state';

@Injectable()
export class AdvicesEffects {
  @Effect()
  getAdvices$ = this.actions$.pipe(
    ofType<GetAdvices>(EnumAdvicesActions.GetAdvices),
    switchMap(() => this.httpService.getAdvicesData()),
    switchMap((advices: AdvicesStateInterface) => of(new GetAdvicesSuccess(advices)))
  );

  constructor(
    private httpService: HttpService,
    private actions$: Actions
  ) { }
}
