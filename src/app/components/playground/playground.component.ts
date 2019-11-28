import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, Subscription, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { GameAdviceInterface } from 'src/app/interfaces/gameAdvice.interface';
import { CellInterface } from '../../interfaces/cell.interface';
import { ShipsDataInterface } from '../../interfaces/shipsData.interface';

import { GameService } from 'src/app/services/game.service';
import { ShipsService } from '../../services/ships.service';

import { AppStateInterface } from '../../store/state/app.state';
import { WebSocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: [
    './playground.component.scss',
    './playground.animation.scss',
    './playground.adaptive.scss'
  ]
})

export class PlaygroundComponent implements OnInit, OnDestroy {

  public playerName: string;
  public enemyName: string;
  public gameOn: boolean;
  public gameOver: boolean;
  public winner: string;
  public mode: string;
  public time: string;
  public playerField: CellInterface[][];
  public computerField: CellInterface[][];
  public enemyField: CellInterface[][];
  public messages: string[];
  private readyToPlay: boolean;
  private gameAdvices: GameAdviceInterface[];
  private preGameAdvices: GameAdviceInterface[];
  private shipsData: ShipsDataInterface[];

  public advice: GameAdviceInterface;
  private currentAdviceIndex = 0;
  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private gameService: GameService,
    private shipsService: ShipsService,
    private wsService: WebSocketService,
    private store: Store<AppStateInterface>
  ) { }

  // таймер, который дает советы каждые 15 секунд, начиная со второй секунды
  advice$: Subscription = timer(2e3, 15e3)
    .pipe(takeUntil(this.destroy))
    .subscribe(num => this.getAdvice(num));

  private getAdvice(num: number): void {
    if (this.gameOver) {
      this.advice = null;
    } else {
      this.generateAdvice(this.gameOn && !this.gameOver
        ? this.gameAdvices
        : this.preGameAdvices,
        num
      );
    }
  }

  private generateAdvice(advices: GameAdviceInterface[], num: number): void {
    // генерируем рандомный номер подсказки
    const getIndex = (): number => Math.round(Math.random() * ((num % advices.length) || 1));
    let index: number = getIndex();

    // условие для того, чтобы не показывать подряд одинаковые подсказки
    let whileCounter = 0;
    while (index === this.currentAdviceIndex && whileCounter++ < 100) {
      index = getIndex();
    }

    this.currentAdviceIndex = index;
    this.advice = advices[index];
  }

  ngOnInit(): void {
    this.store.pipe(takeUntil(this.destroy)).subscribe(allState => {
      const {
        player: { username, field },
        game: {
          messages,
          gameOn,
          gameOver,
          winner,
          mode,
          readyToPlay,
          time
        },
        computer,
        enemy,
        advices: { gameAdvices, preGameAdvices },
        config: { shipsData }
      } = allState;
      this.playerField = field;
      this.playerName = username;
      this.enemyName = enemy.username;
      this.messages = messages;
      this.gameOn = gameOn;
      this.gameOver = gameOver;
      this.winner = winner;
      this.mode = mode;
      this.time = time;
      this.readyToPlay = readyToPlay;
      this.computerField = computer.field;
      this.enemyField = enemy.field;
      this.gameAdvices = gameAdvices;
      this.preGameAdvices = preGameAdvices;
      this.shipsData = shipsData;
    });
    if (this.readyToPlay) this.shipsService.allShips = new Array(this.shipsData.length).fill([]);
  }

  ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }
}
