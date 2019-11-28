import { GameAdviceInterface } from '../../interfaces/gameAdvice.interface';

export interface AdvicesStateInterface {
  preGameAdvices?: GameAdviceInterface[];
  gameAdvices?: GameAdviceInterface[];
}

export const initialAdvicesState = {
  preGameAdvices: [],
  gameAdvices: []
};
