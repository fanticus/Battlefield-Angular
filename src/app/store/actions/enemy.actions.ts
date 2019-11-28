import { Action } from '@ngrx/store';

import { EnemyStateInterface } from '../state/enemy.state';

export enum EnumEnemyActions {
  GetEnemy = '[Enemy] Get Enemy',
  SetEnemy = '[Enemy] Set Enemy'
}

export class GetEnemy implements Action {
  public readonly type = EnumEnemyActions.GetEnemy;

  constructor(
    public payload: EnemyStateInterface
  ) { }
}

export class SetEnemy implements Action {
  public readonly type = EnumEnemyActions.SetEnemy;

  constructor(
    public payload: EnemyStateInterface
  ) { }
}

export type EnemyActions = GetEnemy
  | SetEnemy;
