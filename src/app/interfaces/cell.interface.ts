import { CoordsInterface } from './coords.interface';

export interface CellInterface extends CoordsInterface {
    isShip?: boolean;
    cellStatus?: string;
    idShip?: string;
}
