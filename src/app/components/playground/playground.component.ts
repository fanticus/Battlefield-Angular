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
    private store: Store<AppStateInterface>
  ) {
    timer(5e3, 7e4)                       // <- удалить этот таймер, он для тестов, обновляет нужный таймер каждые 70 секунд
    .pipe(takeUntil(this.destroy))
    .subscribe(() => {
      this.timer$.unsubscribe();
      this.timer$ = this.setTimer();
    });
  }

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


  // ------------- Таймер ->> ------------- //
  time: string;
  timer$: Subscription = timer(0).pipe(takeUntil(this.destroy)).subscribe();

  setTimer(): Subscription {
    const delay = 1e3;                     // таймер устанавливаем на 1 секунду
    let callback;
    console.log('запускаем таймер');
    callback = (seconds: number) => {
      const minutes: number = Math.floor(seconds / 60);
      this.time = ('00' + minutes).slice(minutes < 10 ? -1 : -2) + ':' + ('00' + (seconds - minutes * 60)).slice(-2);
    };

    return timer(0, delay)
    .pipe(takeUntil(this.destroy))
    .subscribe(callback);
  }
// ------------- <<- Таймер ------------- //


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
          readyToPlay
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
