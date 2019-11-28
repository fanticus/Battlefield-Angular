import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { WebSocketService } from 'src/app/services/websocket.service';

import { GameService } from 'src/app/services/game.service';

import { AppStateInterface } from '../../store/state/app.state';

import { SetPlayerName } from '../../store/actions/player.actions';
import { SetGame } from '../../store/actions/game.actions';

import { selectPlayerName } from '../../store/selectors/player.selector';
import { selectGameMode } from '../../store/selectors/game.selector';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss',
    './login.animation.scss'
  ]
})

export class LoginComponent implements OnInit, OnDestroy {

  public myForm: FormGroup;
  private playerName: string;
  private mode: string;
  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private gameService: GameService,
    private wsService: WebSocketService,
    private store: Store<AppStateInterface>
  ) { }

  login(): void {

    // если логин в форме отличается от текущего юзера, то подключаемся к новой игре
    const username = this.myForm.value.username;
    const mode = this.myForm.controls.mode.value;

    if (this.playerName !== username || this.mode !== mode) {

      const id = username + Date.now();

      if (this.wsService.socket) {
        this.gameService.passGame(this.mode);
      }

      this.setDataState({ id, username, mode });

      // инициализируем новую игру
      this.gameService.gameInit();
    }
  }

  private setDataState({ username, id, mode }): void {
    this.store.dispatch(new SetPlayerName({
      username,
      id
    }));
    this.store.dispatch(new SetGame({
      mode
    }));
    // записываем в localStorage user
    localStorage.setItem('userID', id);
    localStorage.setItem('username', username);
  }

  ngOnInit() {
    this.store.pipe(select(selectPlayerName), takeUntil(this.destroy)).subscribe(playerName => {
      this.playerName = playerName;
    });
    this.store.pipe(select(selectGameMode), takeUntil(this.destroy)).subscribe(mode => {
      if (this.mode
          && this.mode !== mode
          && mode === 'computer') {
        this.gameService.passGame(this.mode);
      }
      this.mode = mode;
    });

    // данные формы логина
    this.myForm = new FormGroup({
      username: new FormControl(
        this.playerName,
        [
          Validators.required,
          Validators.pattern('[a-zA-Z]+')
        ]
      ),
      mode: new FormControl(
        // Заблокирован бота
        /*this.mode,*/
        {
          disabled: true,
          value: 'online'
        },
        [Validators.required]
      )
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }
}
