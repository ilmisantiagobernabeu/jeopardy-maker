export enum ClueType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
}

export interface Clue {
  type: ClueType;
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

export interface PlayerObject {
  socketId: string;
  score: number;
  name?: string;
  keys?: string[];
  ping: number;
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

export type SingleGame = {
  name: string;
  rounds: GameBoard[][];
  userId: string;
  isPublic: boolean;
};

export type Game = {
  [key: string]: SingleGame;
};

export interface GameState {
  name: string;
  guid: string;
  games: Game;
  players: Players;
  playersThatLeft: PlayerObject[];
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
  ["pong"]: (timestamp: number) => void;
  ["gameState updated"]: (gameStateFromServer: GameState) => void;
  ["player successfully added to game"]: () => void;
}

type DailyDoubleObject = {
  dailyDoubleAmount: number;
  arrayIndex: number;
  clueText: string;
};

export interface ClientToServerEvents {
  ["Delete the player"]: (roomId: string, socketId: string) => void;
  ["Set ping of a phone buzzer"]: (roomId: string, timestamp: number) => void;
  ["ping"]: (timestamp: number) => void;
  ["old player rejoined"]: (roomId: string, playerName?: string | null) => void;
  ["player signed up"]: (playerName: string, roomId: string) => void;
  ["A player answers the clue"]: (clueObject: {
    value: number;
    arrayIndex: number;
    clueText?: string;
    roomId: string;
  }) => void;
  ["Host modifies the score"]: (playerObject: {
    socket: string;
    name: string;
    score: number;
    roomId: string;
  }) => void;
  ["Host activates the buzzers"]: (roomId: string) => void;
  ["A player hits the buzzer"]: (roomId: string) => void;
  ["A player with a button hits the buzzer"]: (
    playerName: string,
    roomId: string
  ) => void;
  ["No player knows the answer"]: (
    clueObject: {
      arrayIndex: number;
      clueText: string;
    },
    roomId: string
  ) => void;
  ["Host selects a clue"]: (clueObject: Clue, roomId: string) => void;
  ["Host deselects a clue"]: (roomId: string) => void;
  ["Host navigates to another round"]: (round: number, roomId: string) => void;
  ["A player sets daily double wager"]: (
    dailyDoubleObject: DailyDoubleObject,
    roomId: string
  ) => void;
  ["Host loads the game board for the first time"]: (
    game: string,
    roomId: string
  ) => void;
  ["Host restarts the game"]: (
    gameName: string,
    roomId: string,
    userId: string
  ) => void;
  ["Host refreshes the room code"]: (
    roomId: string | null,
    previousRoomId: string | null
  ) => void;
  ["Get user created boards"]: (roomId: string, userId: string) => void;
  ["Host reloads the board page"]: (roomId: string) => void;
  ["Host changes the game"]: (
    gameName: string,
    players: Players | undefined,
    roomId: string,
    userId: string
  ) => void;
  ["Host adds a team with a button"]: (
    teamObject: {
      playerName: string;
      keys: string[];
    },
    roomId: string
  ) => void;
  ["Team selects a daily double clue"]: (roomId: string) => void;
  ["create a new game"]: (
    game: SingleGame,
    roomId: string,
    userId: string
  ) => void;
  ["delete a game"]: (gameName: string, roomId: string) => void;
  ["update player score manually"]: (
    socketId: string,
    score: number,
    roomId: string
  ) => void;
}
