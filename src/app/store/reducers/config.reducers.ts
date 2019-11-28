import { EnumConfigActions, ConfigActions } from '../actions/config.actions';
import { ConfigStateInterface, initialConfigState } from '../state/config.state';

export const configReducers = (
  state = initialConfigState,
  action: ConfigActions
): ConfigStateInterface => {
  const { GetConfigSuccess, SetConfig } = EnumConfigActions;
  switch (action.type) {
    case GetConfigSuccess: {
      return action.payload;
    }
    case SetConfig: {
      return action.payload;
    }
    default:
      return state;
  }
};
