import { createSelector } from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';
import { ComputerStateInterface } from '../state/computer.state';
import { ShipInterface } from '../../interfaces/ship.interface';
import { CoordsInterface } from '../../interfaces/coords.interface';
import {CellInterface} from '../../interfaces/cell.interface';

const computerState = (state: AppStateInterface) => state.computer;

export const selectComputerData = createSelector(
  computerState,
  (computerData: ComputerStateInterface): ComputerStateInterface => computerData
);

export const selectComputerName = createSelector(
  computerState,
  (computerData: ComputerStateInterface): string => computerData.username
);

export const selectComputerShips = createSelector(
  computerState,
  (computerData: ComputerStateInterface): ShipInterface[] => computerData.ships
);

export const selectComputerEnemyCoords = createSelector(
  computerState,
  (computerData: ComputerStateInterface): CoordsInterface[] => computerData.enemyCoords
);

export const selectComputerField = createSelector(
  computerState,
  (computerData: ComputerStateInterface): CellInterface[][] => computerData.field
);
