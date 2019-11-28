import { Action } from '@ngrx/store';

import { ComputerStateInterface } from '../state/computer.state';

export enum EnumComputerActions {
  GetComputer = '[Computer] Get Computer',
  SetComputer = '[Computer] Set Computer'
}

export class GetComputer implements Action {
  public readonly type = EnumComputerActions.GetComputer;

  constructor(
    public payload: ComputerStateInterface
  ) { }
}

export class SetComputer implements Action {
  public readonly type = EnumComputerActions.SetComputer;

  constructor(
    public payload: ComputerStateInterface
  ) { }
}

export type ComputerActions = GetComputer
  | SetComputer;
