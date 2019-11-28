import { EnumComputerActions, ComputerActions } from '../actions/computer.actions';
import { ComputerStateInterface, initialComputerState } from '../state/computer.state';

export const computerReducers = (
  state = initialComputerState,
  action: ComputerActions
): ComputerStateInterface => {
  const { GetComputer, SetComputer } = EnumComputerActions;
  switch (action.type) {
    case GetComputer: {
      return action.payload;
    }
    case SetComputer: {
      return {
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
};
