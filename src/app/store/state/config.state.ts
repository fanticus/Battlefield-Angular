import { ShipsDataInterface } from '../../interfaces/shipsData.interface';

export interface ConfigStateInterface {
  fieldSize?: number;
  shipsData?: ShipsDataInterface[];
}

export const initialConfigState = {
  fieldSize: 0,
  shipsData: []
};
