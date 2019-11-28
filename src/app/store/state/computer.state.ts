import { CellInterface } from '../../interfaces/cell.interface';
import { ShipInterface } from '../../interfaces/ship.interface';
import { CoordsInterface } from '../../interfaces/coords.interface';

export interface ComputerStateInterface {
  id?: string;
  field?: CellInterface[][];
  username?: string;
  ships?: ShipInterface[];
  enemyCoords?: CoordsInterface[];
}

export const initialComputerState = {
  id: 'computer',
  field: [],
  ships: [],
  username: 'computer'
};
