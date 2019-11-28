import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
// import { DragDropModule } from '@angular/cdk/drag-drop';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { PlaygroundComponent } from './components/playground/playground.component';
import { BattlefieldComponent } from './components/battlefield/battlefield.component';
import { RulesComponent } from './components/rules/rules.component';
import { SettingsfieldComponent } from './components/settingsfield/settingsfield.component';
import { LoginComponent } from './components/login/login.component';
// import { CellComponent } from './components/cell/cell.component';
import { ShipsComponent } from './components/ships/ships.component';

import { GameGuard } from './guards/game.guard';

import { appReducers, metaReducers } from './store/reducers/app.reducers';
import { AdvicesEffects } from './store/effects/advices.effects';
import { ConfigEffects } from './store/effects/config.effects';

const appRoutes: Routes = [
  {path: 'rules', component: RulesComponent},
  {path: 'login', component: LoginComponent},
  {path: 'game', component: PlaygroundComponent, canActivate: [GameGuard]},
  {path: '', component: PlaygroundComponent, canActivate: [GameGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    PlaygroundComponent,
    BattlefieldComponent,
    RulesComponent,
    SettingsfieldComponent,
    LoginComponent,
    ShipsComponent,
    // CellComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    // DragDropModule,
    // BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    StoreModule.forRoot(appReducers, { metaReducers }),
    EffectsModule.forRoot([
      AdvicesEffects,
      ConfigEffects
    ]),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [GameGuard],
  bootstrap: [AppComponent]
})

export class AppModule { }
