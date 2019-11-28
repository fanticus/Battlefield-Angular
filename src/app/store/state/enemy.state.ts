import { CellInterface } from '../../interfaces/cell.interface';

export interface EnemyStateInterface {
  field?: CellInterface[][];
  username?: string;
}

export const initialEnemyState = {
  field: [],
  username: ''
};
