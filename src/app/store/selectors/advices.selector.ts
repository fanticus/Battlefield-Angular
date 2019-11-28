import { createSelector } from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';
import { AdvicesStateInterface } from '../state/advices.state';

const advicesState = (state: AppStateInterface): AdvicesStateInterface => state.advices;

export const selectGameAdvices = createSelector(
  advicesState,
  (state: AdvicesStateInterface) => state.gameAdvices
);

export const selectPreGameAdvices = createSelector(
  advicesState,
  (state: AdvicesStateInterface) => state.preGameAdvices
);
