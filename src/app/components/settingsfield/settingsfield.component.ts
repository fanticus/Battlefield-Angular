import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ShipsDataInterface } from '../../interfaces/shipsData.interface';
import { ShipInterface } from '../../interfaces/ship.interface';
import { CellInterface } from '../../interfaces/cell.interface';

import { ShipsService } from 'src/app/services/ships.service';
import { GameService } from 'src/app/services/game.service';
import { BattlefieldService } from 'src/app/services/battlefield.service';
import { WebSocketService } from '../../services/websocket.service';

import { AppStateInterface } from '../../store/state/app.state';

import { SetPlayer } from '../../store/actions/player.actions';
import { SetGame } from '../../store/actions/game.actions';

import { selectConfigData } from '../../store/selectors/config.selector';
import { selectGameData } from '../../store/selectors/game.selector';
import { selectPlayerData } from '../../store/selectors/player.selector';

@Component({
  selector: 'app-settingsfield',
  templateUrl: './settingsfield.component.html',
  styleUrls: [
    './settingsfield.component.scss',
    './buttons.animation.scss'
  ]
})
export class SettingsfieldComponent implements OnInit, OnDestroy {

  public shipsData: ShipsDataInterface[];
  public playerShips: ShipInterface[];
  public gameOn: boolean;
  public searchEnemy: boolean;
  public readyToPlay: boolean;
  private fieldSize: number;
  private mode: string;
  private playerField: CellInterface[][];
  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private gameService: GameService,
    private wsService: WebSocketService,
    private store: Store<AppStateInterface>
  ) { }

  onAuto(): void {
    // генерируем автоматически корабли
    const ships = this.shipsService.generateShips();
    // убираем все корабли для ручной расстановки и сбрасываем статус клеток на поле игрока
    this.shipsService.allShips = new Array(this.shipsData.length).fill([]);
    this.shipsService.occupiedPlayerCells = new Array(this.fieldSize).fill(null).map(() => {
      return new Array(this.fieldSize).fill(false);
    });

    // добавляем сгенерируемые корабли
    this.store.dispatch(new SetPlayer({
        ships,
        field: this.battlefieldService.getField(ships)
    }));

    // все корабли поставлены - готовы к игре
    this.store.dispatch(new SetGame({
      readyToPlay: true
    }));
  }

  onPlay(): void {
    // запускаем игру
    if (this.mode === 'online') {
      this.store.dispatch(new SetGame({
        searchEnemy: true
      }));
    } else {
      this.store.dispatch(new SetGame({
        gameOn: true
      }));
    }
    this.gameService.game();
  }

  onManual(): void {
    // возвращаем все корабли в сток для их ручной расстановки
    const ships = [];

    this.shipsService.playerShipsInit();
    this.store.dispatch(new SetPlayer({
      ships,
      field: this.battlefieldService.getField(ships)
    }));
    this.store.dispatch(new SetGame({
      readyToPlay: false
    }));
  }

  ngOnInit(): void {
    this.store.pipe(select(selectGameData), takeUntil(this.destroy)).subscribe(gameState => {
      this.readyToPlay = gameState.readyToPlay;
      this.gameOn = gameState.gameOn;
      this.searchEnemy = gameState.searchEnemy;
      this.mode = gameState.mode;
    });
    this.store.pipe(select(selectConfigData), takeUntil(this.destroy)).subscribe(configState => {
      const { fieldSize, shipsData } = configState;
      this.shipsData = shipsData;
      this.fieldSize = fieldSize;
    });
    this.store.pipe(select(selectPlayerData), takeUntil(this.destroy)).subscribe(playerState => {
      const { ships, field } = playerState;
      this.playerShips = ships;
      this.playerField = field;
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }
}
