import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { CellInterface } from 'src/app/interfaces/cell.interface';
import { ShipInterface } from 'src/app/interfaces/ship.interface';

import { GameService } from 'src/app/services/game.service';
import { ShipsService } from 'src/app/services/ships.service';
import { BattlefieldService } from 'src/app/services/battlefield.service';
import { ToolsService } from 'src/app/services/tools.service';

import { AppStateInterface } from '../../store/state/app.state';

import { SetPlayer, AddPlayerShip } from '../../store/actions/player.actions';
import { SetGame } from '../../store/actions/game.actions';

import { selectPlayerShips } from '../../store/selectors/player.selector';
import { selectGameData, selectPlayerIsShooter } from '../../store/selectors/game.selector';


@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: [
    './battlefield.component.scss',
    './battlefield.animation.scss'
  ]
})

export class BattlefieldComponent implements OnInit, OnDestroy {
  //  ---  Добавить в редакс shipsService.currentShip, используется в верстке

  @Input() isEnemyField: boolean;
  @Input() field: CellInterface[][];

  public gameOn: boolean;
  public gameOver: boolean;
  public playerIsShooter: boolean;
  public searchEnemy: boolean;
  private mode: string;
  private playerShips: ShipInterface[];
  private destroyed$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private gameService: GameService,
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private toolsService: ToolsService,
    private store: Store<AppStateInterface>
  ) { }

  onCellClick(cell: CellInterface): void {

    // условие для выстрела по противнику
    if (this.isEnemyField
      && this.playerIsShooter) {
      this.onFireAction(cell);
    }
    // условие для ручной расстановки корабля на поле
    if (!this.isEnemyField
      && !this.gameOn
      && this.shipsService.currentShip
      && !cell.isShip) {
      this.manualPlacementShipAction(cell);
    }
    // условие для смены направления корабля
    // если поле игрока, игра еще не началась и в текущей ячейке корабль
    if (!this.isEnemyField
      && !this.gameOn
      && cell.isShip) {
      this.changeDirectionShipAction(cell);
    }
  }

  private onFireAction(cell): void {
    // стреляем, если поле противника и игрок - стрелок
    const { coordX, coordY } = cell;

    this.gameService.onFire(coordX, coordY, 'enemy', 'player');

    // если игрок промахнулся, то стреляет компьютер
    if (this.mode === 'computer' && !this.playerIsShooter) {
      this.gameService.enemyOnFire();
    }
  }

  // Проверить работоспособность, не корректно отрабатывает
  private manualPlacementShipAction(cell) {
    // пробуем разместить корабль
    const shipDirection: number = this.toolsService.getRandom(0, 1);
    const { currentShip, occupiedPlayerCells, allShips } = this.shipsService;

    // генерируем корабль
    let ship: ShipInterface = this.shipsService.placeShip(currentShip, cell, shipDirection);

    if (!ship) {
      // корабль не сгенерировался, то пробуем в другом направлении
      ship = this.shipsService.placeShip(currentShip, cell, Number(!shipDirection));
    }

    if (ship) {
      // корабль сгенерировался
      // меняем статус у клеток корабля и вокруг на занятые
      ship.coords.forEach((coords) => {
        this.shipsService.occupyCells(occupiedPlayerCells, coords);
      });

      // добавляем корабль игроку
      this.store.dispatch(new AddPlayerShip(ship));

      // обновляем поле
      this.store.dispatch(new SetPlayer({
        field: this.battlefieldService.getField(this.playerShips)
      }));

      // если все корабли установлены, то готовы к игре
      if (allShips.every(ships => !ships.length)) {
        this.store.dispatch(new SetGame({
          readyToPlay: true
        }));
      }
    }
  }

  private changeDirectionShipAction(cell) {
    // находим наш корабль среди кораблей игрока и вырезаем
    const shipIndex: number = this.playerShips.findIndex((ship: ShipInterface) => ship.id === cell.idShip);
    const ship: ShipInterface = this.playerShips.splice(shipIndex, 1)[0];

    // меняем статус клеток корабля и вокруг на незанятые
    ship.coords.forEach((coords) => {
      this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords, false);
    });

    // для остальных кораблей обновляем статус занятых клеток, если где-то было пересечение с предыдущим кораблем
    this.playerShips.forEach(ship => {
      ship.coords.forEach((coords) => {
        this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords);
      });
    });

    // отменяем выбор текущего корабля из стока для размещения на поле
    // чтобы работать с кораблем на поле, а не в стоке
    this.shipsService.currentShip = null;

    // генерируем новый корабль с другим направлением
    const newShip: ShipInterface = this.shipsService.placeShip(ship, ship.coords[0], ship.direction ? 0 : 1);

    // если получилось, то обновляем корабли и поле, иначе - возвращаем корабль на место
    if (newShip) {
      this.store.dispatch(new AddPlayerShip(newShip));
      this.store.dispatch(new SetPlayer({
        field: this.battlefieldService.getField(this.playerShips)
      }));
    } else {
      this.shipsService.placeShip(ship, ship.coords[0], ship.direction);
      this.store.dispatch(new AddPlayerShip(ship));
    }
  }

  ngOnInit(): void {
    this.store.pipe(takeUntil(this.destroyed$)).subscribe(state => {
      const { player, game } = state;
      const { gameOn, gameOver, playerIsShooter, searchEnemy, mode } = game;
      this.gameOn = gameOn;
      this.gameOver = gameOver;
      this.playerIsShooter = playerIsShooter;
      this.searchEnemy = searchEnemy;
      this.mode = mode;
      this.playerShips = player.ships;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(null);
    this.destroyed$.complete();
  }
}
