export interface Clue {
  text: string;
  answer: string;
  alreadyPlayed?: boolean;
  isDailyDouble?: boolean;
}

export interface GameBoard {
  category: string;
  clues: Clue[];
}

export interface GameObject {
  isBuzzerActive: boolean;
  gameBoard: GameBoard[];
}

export type ButtonColor = "green" | "yellow" | "red";

export interface PlayerObject {
  socketId: string;
  score: number;
  name?: string;
  color?: ButtonColor | "";
}

export interface Players {
  [key: string]: PlayerObject;
}

export type HistoryPlayer = {
  socket: string;
  name: string;
  score: number;
  totalScore: number;
  answer: "correct" | "incorrect";
  timeStamp: Date;
};

export type SingleGame = { name: string; rounds: GameBoard[][] };

export type Game = {
  [key: string]: SingleGame;
};

export interface GameState {
  name: string;
  guid: string;
  games: Game;
  players: Players;
  isBuzzerActive: boolean;
  activePlayer: string | null;
  lastActivePlayer: string | null;
  incorrectGuesses: string[];
  gameBoard: GameBoard[];
  activeClue: Clue | null;
  previousClue: Clue | null;
  dailyDoubleAmount?: number;
  history: HistoryPlayer[];
}

export interface ServerToClientEvents {
  ["gameState updated"]: (gameStateFromServer: GameState) => void;
  ["play correct sound"]: () => void;
  ["play incorrect sound"]: () => void;
  ["player successfully added to game"]: () => void;
  ["existing player returned"]: () => void;
}

type DailyDoubleObject = {
  dailyDoubleAmount: number;
  arrayIndex: number;
  clueText: string;
};

export interface ClientToServerEvents {
  ["new player joined"]: (playerName?: string | null) => void;
  ["a player disconnected"]: () => void;
  ["give updated game state"]: () => void;
  ["player signed up"]: (playerName: string) => void;
  ["A player answers the clue"]: (clueObject: {
    value: number;
    arrayIndex: number;
    clueText?: string;
  }) => void;
  ["Host modifies the score"]: (playerObject: {
    socket: string;
    name: string;
    score: number;
  }) => void;
  ["Host activates the buzzers"]: () => void;
  ["A player hits the buzzer"]: () => void;
  ["A player with a button hits the buzzer"]: (color: ButtonColor) => void;
  ["No player knows the answer"]: (clueObject: {
    arrayIndex: number;
    clueText: string;
  }) => void;
  ["Host selects a clue"]: (clueObject: Clue) => void;
  ["Host deselects a clue"]: () => void;
  ["Host navigates to another round"]: (round: number) => void;
  ["A player sets daily double wager"]: (
    dailyDoubleObject: DailyDoubleObject
  ) => void;
  ["Host loads the game board for the first time"]: (game: string) => void;
  ["Host restarts the game"]: (gameName: string) => void;
  ["Host changes the game"]: (gameName: string) => void;
  ["Host adds a team with a button"]: (teamObject: {
    playerName: string;
    color: ButtonColor | "";
  }) => void;
  ["Team selects a daily double clue"]: () => void;
  ["create a new game"]: (game: SingleGame) => void;
  ["delete a game"]: (gameName: string) => void;
  ["update player score manually"]: (socketId: string, score: number) => void;
}
