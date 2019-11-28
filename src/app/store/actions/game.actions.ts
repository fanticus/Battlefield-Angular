import { Action } from '@ngrx/store';

import { GameStateInterface } from '../state/game.state';

export enum EnumGameActions {
  GetGame = '[Game] Get Game',
  SetGame = '[Game] Set Game',
  AddGameMessages = '[Game] Set Game Messages'
}

export class GetGame implements Action {
  public readonly type = EnumGameActions.GetGame;

  constructor(
    public payload: GameStateInterface
  ) { }
}

export class SetGame implements Action {
  public readonly type = EnumGameActions.SetGame;

  constructor(
    public payload: {
      gameOn?: boolean;
      gameOver?: boolean;
      playerIsShooter?: boolean;
      readyToPlay?: boolean;
      winner?: string;
      mode?: string;
      messages?: string[];
      searchEnemy?: boolean;
      time?: string;
    }
  ) { }
}

export class AddGameMessages implements Action {
  public readonly type = EnumGameActions.AddGameMessages;

  constructor(
    public payload: string[]
  ) { }
}

export type GameActions = GetGame
  | SetGame
  | AddGameMessages;
