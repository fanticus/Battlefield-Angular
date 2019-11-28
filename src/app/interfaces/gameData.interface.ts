import { PlayerStateInterface } from '../store/state/player.state';
import { EnemyStateInterface } from '../store/state/enemy.state';

export interface GameDataInterface {
  gameID?: string;
  player1?: PlayerStateInterface;
  player2?: EnemyStateInterface;
  gameOn?: boolean;
  gameOver?: boolean;
  winner?: string;
}
