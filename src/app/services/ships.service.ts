import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { CellInterface } from 'src/app/interfaces/cell.interface';
import { ShipInterface } from 'src/app/interfaces/ship.interface';
import { ShipsDataInterface } from 'src/app/interfaces/shipsData.interface';

import { ToolsService } from './tools.service';

import { AppStateInterface } from '../store/state/app.state';

import { selectConfigData } from '../store/selectors/config.selector';


@Injectable({
  providedIn: 'root'
})

export class ShipsService {

  private shipsData: ShipsDataInterface[];
  private fieldSize: number;

  public currentShip: ShipInterface = null;
  public allShips: any[][];
  public occupiedPlayerCells: boolean[][];

  constructor(
    private toolsService: ToolsService,
    private store: Store<AppStateInterface>
  ) {
    this.store.pipe(select(selectConfigData)).subscribe(config => {
      const { fieldSize, shipsData } = config;
      this.fieldSize = fieldSize;
      this.shipsData = shipsData;
    });
  }


  playerShipsInit(): void {
    this.allShips = [];
    this.occupiedPlayerCells = new Array(this.fieldSize).fill(null).map(() => {
      return new Array(this.fieldSize).fill(false);
    });
    if (this.shipsData) {
      this.shipsData.forEach(shipsType => {
        const ships: any[] = new Array(shipsType.number).fill(shipsType);
        this.allShips.push(ships);
      });
    }
  }


  // ручная установка одного корабля
  // аргументы: корабль, который нужно установить, начальная клетка и направление корабля
  placeShip(
    currentShip: ShipInterface,
    cell: CellInterface,
    direction: number
  ): ShipInterface {
    const coords: CellInterface[] = [];
    const directionX: number = direction;                  // 0 = horizontal, 1 = vertical
    const directionY: number = directionX ? 0 : 1;         // 0 = vertical, 1 = horizontal

    const occupiedCells = this.occupiedPlayerCells;
    const size = currentShip.size;

    const maxCoordX = this.fieldSize - 1 - (size - 1 ) * directionX;
    const maxCoordY = this.fieldSize - 1 - (size - 1 ) * directionY;

    if ((cell.coordX <= maxCoordX) && (cell.coordY <= maxCoordY)
      && !this.isOccupied(occupiedCells, size, cell.coordX, cell.coordY, directionX, directionY)) {

      for (let i = 0; i < size; i++) {
        coords.push({coordX: cell.coordX + (i * directionX), coordY: cell.coordY + (i * directionY)});
        this.occupyCells(occupiedCells, coords[i]);
      }

      const ship: ShipInterface = {
        id: currentShip.type + '-' + (cell.coordX) + ',' + (cell.coordY),
        coords,
        type: currentShip.type,
        size,
        direction: directionX,
        hits: 0,
        isSunk: false
      };

      let currentShipIndex: number;
      this.allShips.forEach((typeShips, index) => {
        for (let i = 0; i < typeShips.length; i++) {
          if (this.currentShip && typeShips[i].type === this.currentShip.type) {
            typeShips.splice(i, 1);
            currentShipIndex = index;
            break;
          }
        }
      });

      if (currentShipIndex && this.allShips[currentShipIndex].length) {
        this.currentShip = this.allShips[currentShipIndex][0];
      } else {
        this.currentShip = null;
      }

      return ship;
    }
  }


  private isOccupied(
    field: boolean[][],
    shipSize: number,
    coordX: number,
    coordY: number,
    directionX: number,
    directionY: number): boolean {

    for (let i = 0; i < shipSize; i++) {
      const countCoordX = coordX + (i * directionX);
      const countCoordY = coordY + (i * directionY);
      if (field[countCoordX][countCoordY]) {
        return true;
      }
    }
    return false;
  }


  occupyCells(field: boolean[][], coords: CellInterface, occupingStatus: boolean = true): void {
    const setOccupingStatus = (x: number, y: number) => {
      const isCell: boolean = field[x] !== undefined;
      if (isCell) {
        field[x][y] = occupingStatus;
      }
    };

    const { coordX, coordY } = coords;

    for (let i = 0; i < 3; i++) {   // 3 - количество ячеек вокруг исходной ячейки
      const countCoordY: number = coordY - 1 + i;
      setOccupingStatus(coordX - 1, countCoordY);
      setOccupingStatus(coordX, countCoordY);
      setOccupingStatus(coordX + 1, countCoordY);
    }
  }


  generateShips(): ShipInterface[] {
    const occupiedCells = new Array(this.fieldSize).fill(null).map(() => {
      return new Array(this.fieldSize).fill(false);
    });

    const oneTypeShips = (type: string, num: number, size: number) => {
      return new Array(num).fill(type).map((type, index) => {

        const coords: CellInterface[] = [];
        let coordX: number;
        let coordY: number;

        const directionX: number = this.toolsService.getRandom(0, 1);       // 0 = horizontal, 1 = vertical
        const directionY: number = directionX ? 0 : 1;                      // 0 = vertical, 1 = horizontal

        do {
          const maxCoordX = this.fieldSize - 1 - (size - 1 ) * directionX;
          const maxCoordY = this.fieldSize - 1 - (size - 1 ) * directionY;
          coordX = this.toolsService.getRandom(0, maxCoordX);
          coordY = this.toolsService.getRandom(0, maxCoordY);
        } while (this.isOccupied(occupiedCells, size, coordX, coordY, directionX, directionY));

        for (let i = 0; i < size; i++) {
          coords.push({
            coordX: coordX + (i * directionX),
            coordY: coordY + (i * directionY)
          });
          this.occupyCells(occupiedCells, coords[i]);
        }

        return {
          id: type + '-' + (++index),
          coords,
          type,
          size,
          direction: directionX,
          hits: 0,
          isSunk: false
        };
      });

    };

    const ships: ShipInterface[] = [];

    this.shipsData.forEach((ship, i) => {
      ships.push(...oneTypeShips(
        this.shipsData[i].type,
        this.shipsData[i].number,
        this.shipsData[i].size
      ));
    });

    return ships;
  }
}
