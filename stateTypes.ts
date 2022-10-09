export interface Clue {
  text: string;
  answer: string;
  alreadyPlayed?: boolean;
}

interface GameBoard {
  category: string;
  clues: Clue[];
}

export interface GameObject {
  isBuzzerActive: boolean;
  gameBoard: GameBoard[];
}

interface PlayerObject {
  score: number;
  count: number;
  name: string;
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
  lastActivePlayer: string;
  incorrectGuesses: string[];
  gameBoard: GameBoard[];
  activeClue: Clue;
}
