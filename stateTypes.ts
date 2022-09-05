interface Clue {
  text: string;
  answer: string;
}

interface GameBoard {
  [category: string]: Clue[];
}

export interface GameObject {
  isBuzzerActive: boolean;
  gameBoard: GameBoard[];
}

interface PlayerObject {
  score: number;
  count: number;
}

interface Players {
  [key: string]: PlayerObject;
}

export interface GameState {
  players: Players;
  count: number;
  score: number;
  isBuzzerActive: boolean;
  activePlayer: string;
  incorrectGuesses: string[];
  gameBoard: GameBoard[];
}
