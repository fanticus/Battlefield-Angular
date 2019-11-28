import { EnumGameActions, GameActions } from '../actions/game.actions';
import { GameStateInterface, initialGameState } from '../state/game.state';

export const gameReducers = (
  state = initialGameState,
  action: GameActions
): GameStateInterface => {
  const { GetGame, SetGame, AddGameMessages } = EnumGameActions;
  switch (action.type) {
    case GetGame: {
      return action.payload;
    }
    case SetGame: {
      return {
        ...state,
        ...action.payload
      };
    }
    case AddGameMessages: {
      return {
        ...state,
        messages: [ ...action.payload, ...state.messages]
      };
    }
    default:
      return state;
  }
};
