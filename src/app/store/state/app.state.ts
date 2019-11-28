import { PlayerStateInterface } from './player.state';
import { EnemyStateInterface } from './enemy.state';
import { ComputerStateInterface } from './computer.state';
import { GameStateInterface } from './game.state';
import { ConfigStateInterface } from './config.state';
import { AdvicesStateInterface } from './advices.state';

export interface AppStateInterface {
  player: PlayerStateInterface;
  enemy: EnemyStateInterface;
  computer: ComputerStateInterface;
  game: GameStateInterface;
  config: ConfigStateInterface;
  advices: AdvicesStateInterface;
}
