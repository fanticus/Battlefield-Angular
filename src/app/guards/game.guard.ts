import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { GameService } from '../services/game.service';

import { AppStateInterface } from '../store/state/app.state';

import { selectPlayerName } from '../store/selectors/player.selector';

@Injectable({
  providedIn: 'root'
})

export class GameGuard implements CanActivate {

  private isUsername: boolean;

  constructor(
    private gameService: GameService,
    private router: Router,
    private store: Store<AppStateInterface>
  ) {
    this.store.pipe(select(selectPlayerName)).subscribe(value => {
      this.isUsername = value !== '';
    });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    if (!this.isUsername) this.router.navigate(['/login']);
    return this.isUsername;
  }
}
