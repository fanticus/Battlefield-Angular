import {
  ActionReducerMap,
  ActionReducer,
  MetaReducer
} from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';

import { playerReducers } from './player.reducers';
import { enemyReducers } from './enemy.reducers';
import { computerReducers } from './computer.reducers';
import { gameReducers } from './game.reducers';
import { configReducers } from './config.reducers';
import { advicesReducers } from './advices.reducers';

export const appReducers: ActionReducerMap<AppStateInterface, any> = {
  player: playerReducers,
  enemy: enemyReducers,
  computer: computerReducers,
  game: gameReducers,
  config: configReducers,
  advices: advicesReducers
};

export function logger(reducer: ActionReducer<AppStateInterface>):
  ActionReducer<AppStateInterface> {
  return (state: AppStateInterface, action: any): AppStateInterface => {
    /*console.log('state', state);
    console.log('action', action);*/
    return reducer(state, action);
  };
}
export const metaReducers: MetaReducer<AppStateInterface>[] = [ logger ];
