import { createSelector } from '@ngrx/store';

import { ShipInterface } from '../../interfaces/ship.interface';

import { AppStateInterface } from '../state/app.state';
import { PlayerStateInterface } from '../state/player.state';
import { CellInterface } from '../../interfaces/cell.interface';

const playerState = (state: AppStateInterface) => state.player;

export const selectPlayerData = createSelector(
  playerState,
  (playerData: PlayerStateInterface): PlayerStateInterface => playerData
);

export const selectPlayerName = createSelector(
  selectPlayerData,
  (playerData: PlayerStateInterface): string => playerData.username
);

export const selectPlayerShips = createSelector(
  selectPlayerData,
  (playerData: PlayerStateInterface): ShipInterface[] => playerData.ships
);

export const selectPlayerField = createSelector(
  selectPlayerData,
  (playerData: PlayerStateInterface): CellInterface[][] => playerData.field
);
