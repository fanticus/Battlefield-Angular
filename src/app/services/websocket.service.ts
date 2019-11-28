import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ReplaySubject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CellInterface } from '../interfaces/cell.interface';
import { ShipInterface } from '../interfaces/ship.interface';

import { BattlefieldService } from './battlefield.service';
import { ShipsService } from './ships.service';

import { AppStateInterface } from '../store/state/app.state';

import { AddGameMessages, SetGame } from '../store/actions/game.actions';
import { SetPlayer } from '../store/actions/player.actions';
import { SetEnemy } from '../store/actions/enemy.actions';

import {selectPlayerData, selectPlayerField} from '../store/selectors/player.selector';
import {selectGameOn} from "../store/selectors/game.selector";


@Injectable({
  providedIn: 'root'
})

export class WebSocketService {

  public socket: WebSocket;
  // private playerShips: ShipInterface[];
  private enemyUsername: string;
  private playerField: CellInterface[][];
  private gameOn: boolean;
  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);
  private timer$: Subscription = timer(0).pipe(takeUntil(this.destroy)).subscribe();

  constructor(
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private store: Store<AppStateInterface>
  ) {
    this.store.pipe(select(selectPlayerField)).subscribe(value => {
      this.playerField = value;
    });
    this.store.pipe(select(selectGameOn)).subscribe(value => {
      this.gameOn = value;
    });
  }

  private setTimer(seconds: number): void {
    const delay = 1e3; // таймер устанавливаем на 1 секунду
    /*console.log('запускаем таймер');*/
    const callback = () => {
      seconds--;
      if (seconds < 0) {
        seconds = 0;
      }
      const minutes: number = Math.floor(seconds / 60);
      // Доработать обнуление переменной при обновлении страницы
      const time: string = ('00' + minutes).slice(minutes < 10 ? -1 : -2) + ':' + ('00' + (seconds - minutes * 60)).slice(-2);
      if (seconds === 0 && !this.gameOn) {
        // костыль
      } else {
        this.store.dispatch(new SetGame({
          time/*: time === '0:00' && seconds !== 0 ? 'Время вышло' : time*/
        }));
      }
    };

    this.timer$ = timer(0, delay)
      .pipe(takeUntil(this.destroy))
      .subscribe(callback);
  }

  private onMessageFromServer(data) {
    /*console.log(`Metod: ${data.state}, data:`, data, 'data.time', data.time);*/

    this.timer$.unsubscribe();
    switch (data.state) {
      case 'FIND_GAME':
        // если пришли данные с настройками игры (data.state = 'FIND_GAME'),
        // инициализируем игру с пришедшими с сервера данными, например:
        this.setDataStateBeginingGame(data);
        this.setTimer(data.time);
        break;

      case 'START_GAME':
        // если пришли данные о готовности/неготовности игроков к игре,
        // то записываем эти данные куда нам надо, например:
        this.setDataStateStartingGame(data);
        this.setTimer(data.time);
        break;

      case 'FIRE':
        // если пришли данные с обновленными настройками игры (поля игроков, простреленные клетки, статус игры и тд),
        // то обновляем аналогичные данные в клиенте, например:
        this.setDataStateFire(data);
        if (!data.gameOver) {
          this.setTimer(data.time);
        }
        break;

      case 'PASS':
        this.setDataStatePassGame(data);
        break;
      case 'TIMEOUT':
        this.setDataStateTimeoutGame(data);
        break;

      case 'CLOSE':
        this.setDataStateCloseGame(data);
        break;

      default:
        console.log(`== Log Error state property from the server response: ${data}`);
    }
    if (data.gameOver) {
      this.enemyUsername = '';
      this.store.dispatch(new SetGame({
        time: ''
      }));
    }
  }

  private setDataStateBeginingGame(data): void {
    this.store.dispatch(new SetPlayer({
      ships: data.player.ships,
      field: data.player.field || this.playerField,
      username: localStorage.getItem('username')
    }));
    this.store.dispatch(new SetEnemy({
      field: data.enemy.field || this.battlefieldService.getField([]),
      username: data.enemy.username
    }));
    this.store.dispatch(new SetGame({
      gameOver: data.gameOver,
      gameOn: data.gameOn,
      messages: data.messages,
      winner: data.winner,
      playerIsShooter: data.playerIsShooter,
      mode: 'online',
      searchEnemy: data.player.ships.length || data.gameOn
    }));

    this.enemyUsername = data.enemy.username;

    if (data.player.ships.length) {
      this.shipsService.allShips = [];
      // this.store.dispatch(new AddGameMessages([`Waiting ${this.enemyUsername}...`]));
    }
  }

  private setDataStateStartingGame(data) {
    const { playerIsShooter, messages } = data;
    this.store.dispatch(new SetGame({
      playerIsShooter,
      messages,
      gameOn: true,
      searchEnemy: false
    }));
  }

  private setDataStateFire(data) {
    this.store.dispatch(new SetGame({
      gameOn: data.gameOn,
      gameOver: data.gameOver,
      messages: data.messages,
      winner: data.winner,
      playerIsShooter: data.playerIsShooter,
      mode: 'online'
    }));
    this.store.dispatch(new SetPlayer({
      ships: data.player.ships,
      field: data.player.field,
      username: localStorage.getItem('username')
    }));
    this.store.dispatch(new SetEnemy({
      field: data.enemy.field,
      username: data.enemy.username
    }));
  }

  private setDataStatePassGame(data) {
    const { gameOver, winner, messages } = data;
    this.store.dispatch(new SetGame({
      messages,
      gameOver,
      winner,
      gameOn: true,
      searchEnemy: false,
      time: ''
    }));
  }

  private setDataStateTimeoutGame(data) {
    const { gameOver, winner, messages } = data;
    this.store.dispatch(new SetGame({
      messages,
      gameOver,
      winner,
      gameOn: true,
      searchEnemy: false,
      time: ''
    }));
  }

  private setDataStateCloseGame(data) {
    const { messages } = data;
    this.store.dispatch(new SetGame({
      messages,
      time: ''
    }));
  }

  openSocket(userID, username): void {
    // подключаемся к 'http://localhost:3000'
    this.socket = new WebSocket('ws://localhost:3000');

    // если подключились успешно - находим игру игроку
    this.socket.onopen = () => {
      // console.log(`Connection is done`);
      this.findGameForUser(userID, username);
      this.store.dispatch(new SetGame({
        searchEnemy: false
      }));
    };

    // вешаем событие, которое срабатывает, когда получаем данные
    this.socket.onmessage = (message) => {
      // принимаем данные с настройками игры
      const data = JSON.parse(message.data);

      this.onMessageFromServer(data);
    };

    // событие, которое срабатывает, когда соединение закрывается
    this.socket.onclose = (event) => {
      if (event.wasClean) {
        /*console.log(`Connection closed, code: ${event.code} reason: ${event.reason}`);*/
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        /*console.log(this.socket);*/
        this.socket = null;
        this.store.dispatch(new AddGameMessages(['Connection is broken']));
      }
    };

    // событие при ошибке
    this.socket.onerror = (error) => {
      this.store.dispatch(new AddGameMessages(['Oops... There\'s some unpleasant error']));
      console.log(`== Log Error unknown socket: ${error}`);
    };
  }

  passGame(userID) {
    if (this.socket) {
      // console.log(`Send to the user's server`);

      // отправляем данные
      this.socket.send(JSON.stringify({ userID, state: 'PASS' }));
    } else {
      // this.store.dispatch(new AddGameMessages(['Oops... There\'s some unpleasant error']));
      this.openSocket(userID, localStorage.getItem('username'));
      // this.passGame(userID);
      // console.log(`== Log Error socket connection while surrender game: ${this.socket}`);
    }
  }

  findGameForUser(userID, username) {
    if (this.socket) {
      // console.log(`Отправляем на сервер юзера`);

      // отправляем данные
      this.socket.send(JSON.stringify({ userID, username, state: 'FIND_GAME' }));
      this.store.dispatch(new AddGameMessages([`Waiting another player...`, `${username} join the game`]));
      this.store.dispatch(new SetGame({
        searchEnemy: true
      }));
    } else {
      // this.store.dispatch(new AddGameMessages(['Oops... There\'s some unpleasant error']));
      // console.log(`== Log Error socket connection in the search game: ${this.socket}`);
      this.openSocket(userID, localStorage.getItem('username'));
      // this.findGameForUser(userID, username);
    }
  }

  startGame(settingsForGame) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({ ...settingsForGame, state: 'START_GAME' }));
      this.store.dispatch(new AddGameMessages([`Waiting ${this.enemyUsername || 'an enemy'}...`]));
    } else {
      // this.store.dispatch(new AddGameMessages(['Oops... There\'s some unpleasant error']));
      this.openSocket(settingsForGame.userID, localStorage.getItem('username'));
      // console.log(`== Log Error socket connection at game start: ${this.socket}`);
      // this.startGame(settingsForGame);
    }
  }

  sendFiredCell(cell, userID) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({ cell, userID, state: 'FIRE' }));
    } else {
      // this.store.dispatch(new AddGameMessages(['Oops... There\'s some unpleasant error']));
      // console.log(`== Log Error socket connection when sending shots: ${this.socket}`);
      this.openSocket(userID, localStorage.getItem('username'));
      // this.sendFiredCell(cell, userID);
    }
  }
}
