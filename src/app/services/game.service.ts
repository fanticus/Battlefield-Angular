import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { CellInterface } from '../interfaces/cell.interface';
import { ShipInterface } from '../interfaces/ship.interface';
import { CoordsInterface } from '../interfaces/coords.interface';

import { BattlefieldService } from './battlefield.service';
import { ShipsService } from './ships.service';
import { HttpService } from './http.service';
import { ToolsService } from './tools.service';

import { AppStateInterface } from '../store/state/app.state';
import { PlayerStateInterface } from '../store/state/player.state';
import { ComputerStateInterface } from '../store/state/computer.state';
import { EnemyStateInterface } from '../store/state/enemy.state';
import { GameStateInterface } from '../store/state/game.state';

import { GetAdvices } from '../store/actions/advices.actions';
import { GetConfig, SetConfig } from '../store/actions/config.actions';
import { SetComputer } from '../store/actions/computer.actions';
import { SetPlayer } from '../store/actions/player.actions';
import { SetGame, AddGameMessages } from '../store/actions/game.actions';
import { SetEnemy } from '../store/actions/enemy.actions';
import { WebSocketService } from './websocket.service';


@Injectable({
  providedIn: 'root'
})

export class GameService {

  private gameState: GameStateInterface;
  private playerState: PlayerStateInterface;
  private computerState: ComputerStateInterface;
  private enemyState: EnemyStateInterface;
  private fieldSize: number;
  private enemyOnFire$: Subscription;
  // добавить типизацию
  public settings = {
    winner: '',
    messages: [],
    readyToPlay: false,
    gameOn: false,
    gameOver: false,
    playerIsShooter: false,
    time: ''
  };


  // playerIsShooter - статус игрока (игрок стреляет или противник)
  // winner - username победителя
  // messages - лог игры
  // readyToPlay - статус готовности (расставлены ли все корабли игрока или нет)
  // gameOn - статус игры (началась или нет)
  // gameOver - статус игры (закончилась или нет)
  // enemyCoords - массив координат для обстрела игрока компьютером

  constructor(
    private httpService: HttpService,
    private battlefieldService: BattlefieldService,
    private shipsService: ShipsService,
    private toolsService: ToolsService,
    private wsService: WebSocketService,
    private store: Store<AppStateInterface>
  ) {
    // (???)
    // инжектим сервис для связи с сервером
    // читаем юзера из локалсторэджа, если есть, то записываем его в локальные данные на клиенте и
    // связываемся с сервером, отправляем ему текущего юзверя
    // получаем от сервера либо данные для игры, если у этого юзера есть какая-то незавершенная игра
    // и записываем их в локальные данные на клиенте
    // либо инициализируем новую игру, если юзер на сервере есть, но открытых игр у него нет
    // (???)
    const id = localStorage.getItem('userID');

    if (id) {
      this.store.dispatch(new SetPlayer({
        username: localStorage.getItem('username')
      }));
      const localState = localStorage.getItem('gameState');
      const defaultLocalState = localStorage.getItem('defaultState');
      if (localState) {
        this.setLocalStorageIsState(localState);
      } else if (defaultLocalState) {

        if (JSON.parse(defaultLocalState).game.mode === 'online') {
          this.setLocalStorageIsState(defaultLocalState);

          this.wsService.openSocket(id, localStorage.getItem('username'));

        } else {
          this.setLocalStorageIsState(defaultLocalState);
        }
      } else {
        console.log('== Log Error default local state is missing');
      }
    }

    // качаем настройки
    this.store.dispatch(new GetConfig());
    // качаем советы
    this.store.dispatch(new GetAdvices());

    this.store.subscribe(state => {
      const { config, game, player, computer, enemy } = state;

      this.fieldSize = config.fieldSize;
      this.gameState = game;
      this.playerState = player;
      this.computerState = computer;
      this.enemyState = enemy;

      /* Сохранение первого дефолтного состояния игры:
      поле пустое,
      отсутствуют сообщения,
      игра не началась и тд
      */
      this.saveStateIsLocalStorage(state);
    });
  }

  private saveStateIsLocalStorage(state) {
    const { config, game, player, computer, enemy } = state;

    if (!this.gameState.gameOn
      && this.playerState.field.length !== 0
      && this.playerState.ships.length === 0
      && this.gameState.mode !== '') {
      localStorage.setItem('defaultState', JSON.stringify({
        config,
        game,
        player,
        ...(this.gameState.mode === 'computer' && { computer })
      }));
    }

    if (this.gameState.gameOn && this.gameState.mode === 'computer') {
      localStorage.setItem('gameState', JSON.stringify({
        config,
        game,
        player,
        computer
      }));
    }
  }

  private setLocalStorageIsState(state) {
    const { player, computer, game, config } = JSON.parse(state);
    this.store.dispatch(new SetConfig(config));
    this.store.dispatch(new SetGame(game));
    this.store.dispatch(new SetPlayer(player));
    this.store.dispatch(new SetComputer(computer));
    this.shipsService.playerShipsInit();
    if (this.enemyOnFire$) this.enemyOnFire$.unsubscribe();
  }

  private setStateInit() {
    this.shipsService.playerShipsInit();

    this.store.dispatch(new SetPlayer({
      ships: [],
      field: this.battlefieldService.getField([])
    }));

    if (this.gameState.mode === 'computer') {
      const ships = this.shipsService.generateShips();
      this.store.dispatch(new SetComputer({
        ships,
        field: this.battlefieldService.getField(ships),
        enemyCoords: this.setEnemyCoords()
      }));
      this.store.dispatch(new SetEnemy({
        field: [],
        username: ''
      }));
      this.store.dispatch(new SetGame({
        ...this.settings,
        playerIsShooter: Math.round(Math.random()) ? true : false
      }));
      if (this.enemyOnFire$) this.enemyOnFire$.unsubscribe();
    } else {
      this.store.dispatch(new SetEnemy({
        username: '',
        field: this.battlefieldService.getField([])
      }));
      this.store.dispatch(new SetGame(this.settings));
    }
  }

  private onGameOver = (enemy: ComputerStateInterface): void => {
    this.store.dispatch(new SetGame({
      winner: enemy.username,
      gameOver: true
    }));
    this.store.dispatch(new AddGameMessages([
      '** Game over **',
      '-',
      '-',
      this.gameState.winner + ' is winner',
      '-'
    ]));
  };

  private setEnemyCoords(): CoordsInterface[] {
    const coords: CoordsInterface[] = [];

    for (let i = 0; i < this.fieldSize; i++) {
      for (let j = 0; j < this.fieldSize; j++) {
        coords.push({
          coordX: i,
          coordY: j
        });
      }
    }
    return coords;
  }

  private setMissCellStatusAround(coords: CoordsInterface, target: string): void {
    const { coordX, coordY } = coords;
    const changeCellStatus = (target, coordX, coordY) => {
      const targetField = this.definitionData(target).field;
      const isCell: boolean = targetField[coordX] !== undefined && targetField[coordX][coordY] !== undefined;

      if (isCell) {
        const cell: CellInterface = targetField[coordX][coordY];

        if (!cell.isShip) cell.cellStatus = 'miss';
      }
    };

    for (let i = 0; i < 3; i++) {   // 3 - количество ячеек вокруг исходной ячейки
      const countCoordY: number = coordY - 1 + i;

      changeCellStatus(target, coordX - 1, countCoordY);
      changeCellStatus(target, coordX, countCoordY);
      changeCellStatus(target, coordX + 1, countCoordY);
    }
  }

  private definitionData = (type: string) => {
    let state;
    if (this.gameState.mode === 'computer' && type === 'enemy') {
      state = this.computerState;
    } else if (type === 'enemy') {
      state = this.enemyState;
    } else {
      state = this.playerState;
    }

    return { ...state };
  }

  private definitionChangeFieldReducer = (type, field) => {
    if (this.gameState.mode === 'computer' && type === 'enemy') {
      return new SetComputer({
        field
      });
    } else if (type === 'enemy') {
      return new SetEnemy({
        field
      });
    } else {
      return new SetPlayer({
        field
      });
    }
  }

  private definitionModeGame(): void {
    const mode = this.gameState.mode;
    switch (mode) {
      case 'online':
        if (this.wsService.socket) {
          this.store.dispatch(new SetGame({
            searchEnemy: true
          }));
          this.wsService.socket.close();    //  <- тут отсоединяем текущего юзера (???)
        }
        this.wsService.openSocket(
          localStorage.getItem('userID'),
          localStorage.getItem('username')
        );
        break;
      case 'computer':
        /*alert('Играем с ботом');*/
        break;
      default:
        console.log(`== Log Error unknown mode: ${mode}`);
    }
  }

  gameInit(): void {
    /*console.log('gameInit');*/
    this.definitionModeGame();
    this.setStateInit();
    localStorage.removeItem('gameState');
  }

  passGame(mode: string): void {
    if (mode === 'computer') {
      this.onGameOver(this.computerState);
    } else {
      this.wsService.passGame(this.playerState.id);
    }
  }

  game(): void {
    let shooter: string;

    if (this.gameState.mode === 'computer') {
      if (this.gameState.playerIsShooter) {
        shooter = 'Player';
      } else {
        shooter = 'Computer';
        this.enemyOnFire();
      }
      this.store.dispatch(new AddGameMessages([ `${shooter} shoots first` ]));
    } else {
      this.wsService.startGame({
        userID: localStorage.getItem('userID'),
        username: localStorage.getItem('username'),
        ships: this.playerState.ships,
        field: this.playerState.field
      });
      // this.store.dispatch(new AddGameMessages([`Waiting ${this.enemyState.username || 'another player'}`]));
    }
  }

  enemyOnFire(): void {
    this.store.dispatch(new AddGameMessages([ '-' ]));

    this.enemyOnFire$ = interval(600).subscribe(() => {
      const enemyCoords: CoordsInterface[] = [ ...this.computerState.enemyCoords ];
      const coordI: number = this.toolsService.getRandom(0, enemyCoords.length - 1);
      const coords: CoordsInterface = enemyCoords.splice(coordI, 1)[0];

      this.store.dispatch(new SetComputer({
        enemyCoords
      }));

      this.onFire(coords.coordX, coords.coordY, 'player', 'enemy');

      if (this.gameState.playerIsShooter
        || !enemyCoords.length) {
        this.enemyOnFire$.unsubscribe();
      }
    });
  }


  onFire(
    coordX: number,
    coordY: number,
    target: string,
    shooter: string
  ): void {
    if (this.gameState.mode === 'computer') {
      const shooterData: ComputerStateInterface = this.definitionData(shooter);
      const targetData: ComputerStateInterface = this.definitionData(target);
      const firedCell: CellInterface = targetData.field[coordX][coordY];
      const { cellStatus, isShip, idShip } = firedCell;
      const missAction = () => {
        firedCell.cellStatus = 'miss';

        this.store.dispatch(new SetGame({
          playerIsShooter: !this.gameState.playerIsShooter
        }));

        this.store.dispatch(new AddGameMessages([
          `${shooterData.username} missed ${targetData.username} on x: ${coordY + 1} y: ${coordX + 1}`
        ]));
      };
      const hitAction = () => {
        let message: string;
        firedCell.cellStatus = 'hit';
        const ship: ShipInterface = targetData.ships.find((ship: ShipInterface) => ship.id === idShip);
        ship.hits++;
        const { hits, size, coords } = ship;

        if (hits === size) {
          coords.forEach((coords: CoordsInterface) => this.setMissCellStatusAround(coords, target));
          ship.isSunk = true;

          message = `${shooterData.username} sank a ${targetData.username}'s ship on x: ${coordY + 1} y: ${coordX + 1}`;
        } else {
          message = `${shooterData.username} shot ${targetData.username} on x: ${coordY + 1} y: ${coordX + 1}`;
        }
        this.store.dispatch(new AddGameMessages([ message ]));
      };

      // start if
      if (!cellStatus && !this.gameState.gameOver) {
        isShip ? hitAction() : missAction();
        this.store.dispatch(this.definitionChangeFieldReducer(target, targetData.field));
      }

      // end if
      if (targetData.ships.every((ship: ShipInterface) => ship.isSunk) && !this.gameState.gameOver) {
        this.onGameOver(shooterData);
      }
    } else {
      this.wsService.sendFiredCell(
        {
          coordX,
          coordY
        },
        localStorage.getItem('userID')
      );
    }
  }
}
