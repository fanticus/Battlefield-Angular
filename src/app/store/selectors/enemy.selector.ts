import { createSelector } from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';
import { EnemyStateInterface } from '../state/enemy.state';
import { ComputerStateInterface } from '../state/computer.state';
import { CellInterface } from '../../interfaces/cell.interface';

const enemyState = (state: AppStateInterface) => state.enemy;

export const selectEnemyData = createSelector(
  enemyState,
  (enemyData: EnemyStateInterface): EnemyStateInterface => enemyData
);

export const selectEnemyName = createSelector(
  enemyState,
  (enemyData: EnemyStateInterface): string => enemyData.username
);

export const selectEnemyField = createSelector(
  enemyState,
  (enemyData: ComputerStateInterface): CellInterface[][] => enemyData.field
);
