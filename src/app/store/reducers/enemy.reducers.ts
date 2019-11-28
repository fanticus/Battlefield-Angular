import { EnumEnemyActions, EnemyActions } from '../actions/enemy.actions';
import { EnemyStateInterface, initialEnemyState } from '../state/enemy.state';

export const enemyReducers = (
  state = initialEnemyState,
  action: EnemyActions
): EnemyStateInterface => {
  const { GetEnemy, SetEnemy } = EnumEnemyActions;
  switch (action.type) {
    case GetEnemy: {
      return action.payload;
    }
    case SetEnemy: {
      return {
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
};
