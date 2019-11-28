import { Action } from '@ngrx/store';

import { AdvicesStateInterface } from '../state/advices.state';

export enum EnumAdvicesActions {
  GetAdvices = '[Advices] Get Advices',
  GetAdvicesSuccess = '[Advices] Get Advices Success'
}

export class GetAdvices implements Action {
  public readonly type = EnumAdvicesActions.GetAdvices;
}

export class GetAdvicesSuccess implements Action {
  public readonly type = EnumAdvicesActions.GetAdvicesSuccess;

  constructor(
    public payload: AdvicesStateInterface
  ) { }
}

export type AdvicesActions = GetAdvices | GetAdvicesSuccess;
