import { EnumAdvicesActions, AdvicesActions } from '../actions/advices.actions';
import { AdvicesStateInterface, initialAdvicesState } from '../state/advices.state';

export const advicesReducers = (
  state = initialAdvicesState,
  action: AdvicesActions
): AdvicesStateInterface => {
  const { GetAdvicesSuccess } = EnumAdvicesActions;
  switch (action.type) {
    case GetAdvicesSuccess: {
      return action.payload;
    }
    default:
      return state;
  }
};
