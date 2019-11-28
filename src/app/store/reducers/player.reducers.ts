import { EnumPlayerActions, PlayerActions} from '../actions/player.actions';
import { PlayerStateInterface, initialPlayerState } from '../state/player.state';

export const playerReducers = (
  state = initialPlayerState,
  action: PlayerActions
): PlayerStateInterface => {
  const {
    GetPlayer,
    SetPlayerName,
    SetPlayer,
    AddPlayerShip
  } = EnumPlayerActions;
  switch (action.type) {
    case GetPlayer: {
      return action.payload;
    }
    case SetPlayerName: {
      const { username, id } = action.payload;
      return {
        ...state,
        username,
        id
      };
    }
    case SetPlayer: {
      return {
        ...state,
        ...action.payload
      };
    }
    case AddPlayerShip: {
      return {
        ...state,
        ships: [ ...state.ships, action.payload ]
      };
    }
    default:
      return state;
  }
};
