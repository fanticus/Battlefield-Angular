import { CoordsInterface } from './coords.interface';

export interface ShipInterface {
    id: string;
    coords: CoordsInterface[];
    type: string;
    size: number;
    direction?: number;
    hits: number;
    isSunk: boolean;
}
