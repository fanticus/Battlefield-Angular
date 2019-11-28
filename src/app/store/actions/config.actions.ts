import { Action } from '@ngrx/store';

import { ConfigStateInterface } from '../state/config.state';

export enum EnumConfigActions {
  GetConfig = '[Config] Get Config',
  GetConfigSuccess = '[Config] Get Config Success',
  SetConfig = '[Config] Set Config',
}

export class GetConfig implements Action {
  public readonly type = EnumConfigActions.GetConfig;
}

export class GetConfigSuccess implements Action {
  public readonly type = EnumConfigActions.GetConfigSuccess;

  constructor(
    public payload: ConfigStateInterface
  ) { }
}

export class SetConfig implements Action {
  public readonly type = EnumConfigActions.SetConfig;

  constructor(
    public payload: ConfigStateInterface
  ) { }
}

export type ConfigActions = GetConfig
  | GetConfigSuccess
  | SetConfig;
