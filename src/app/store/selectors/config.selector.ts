import { createSelector } from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';
import { ConfigStateInterface } from '../state/config.state';

import { ShipsDataInterface } from '../../interfaces/shipsData.interface';

const configState = (state: AppStateInterface) => state.config;

export const selectConfigData = createSelector(
  configState,
  (config: ConfigStateInterface): ConfigStateInterface => config
);

export const selectFieldSize = createSelector(
  configState,
  (config: ConfigStateInterface): number => config.fieldSize
);

export const selectShipsData = createSelector(
  configState,
  (config: ConfigStateInterface): ShipsDataInterface[] => config.shipsData
);
