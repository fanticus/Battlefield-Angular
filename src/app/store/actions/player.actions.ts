import { Action } from '@ngrx/store';

import { ShipInterface } from '../../interfaces/ship.interface';

import { PlayerStateInterface } from '../state/player.state';

export enum EnumPlayerActions {
  GetPlayer = '[Player] Get Player',
  SetPlayer = '[Player] Set Player',
  SetPlayerName = '[Player] Set Player Name',
  AddPlayerShip = '[Player] Add Player Ship'
}

export class GetPlayer implements Action {
  public readonly type = EnumPlayerActions.GetPlayer;

  constructor(
    public payload: PlayerStateInterface
  ) { }
}

export class SetPlayer implements Action {
  public readonly type = EnumPlayerActions.SetPlayer;

  constructor(
    public payload: PlayerStateInterface
  ) { }
}

export class SetPlayerName implements Action {
  public readonly type = EnumPlayerActions.SetPlayerName;

  constructor(
    public payload: {
      username: string;
      id: string;
    }
  ) { }
}

export class AddPlayerShip implements Action {
  public readonly type = EnumPlayerActions.AddPlayerShip;

  constructor(
    public payload: ShipInterface
  ) { }
}

export type PlayerActions = GetPlayer
  | SetPlayer
  | SetPlayerName
  | AddPlayerShip;
