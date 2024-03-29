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

export interface PlayerObject {
  socketId: string;
  score: number;
  name: string;
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

type BuzzerHit = {
  timestamp: number;
  socketId: string;
};

export interface GameState {
  name: string;
  guid: string;
  round: number;
  game: SingleGame;
  players: Players;
  playersThatLeft: PlayerObject[];
  isBuzzerActive: boolean;
  activePlayer: string | null;
  lastActivePlayer: string | null;
  incorrectGuesses: string[];
  activeClue: Clue | null;
  previousClue: Clue | null;
  dailyDoubleAmount?: number;
  history: HistoryPlayer[];
  firstBuzz: boolean;
  buzzerHits: { [socketId: string]: BuzzerHit };
  secondPlace: { name: string; amountInMs: number } | null;
}

export interface ServerToClientEvents {
  ["gameState updated"]: (gameStateFromServer: GameState) => void;
  ["player successfully added to game"]: () => void;
  ["Buzzers are activated"]: () => void;
  ["buzzer hit ping"]: (
    clientTimeStamp: number,
    serverTimeStamp: number
  ) => void;
}

type DailyDoubleObject = {
  dailyDoubleAmount: number;
  arrayIndex: number;
  clueText: string;
};

export interface ClientToServerEvents {
  ["Delete the player"]: (roomId: string, socketId: string) => void;
  ["Edit player name"]: (
    roomId: string,
    socketId: string,
    newPlayerName: string
  ) => void;
  ["Set ping of a phone buzzer"]: (roomId: string, timestamp: number) => void;
  ["old player rejoined"]: (roomId: string, playerName?: string | null) => void;
  ["player signed up"]: (playerName: string, roomId: string) => void;
  ["A player answers the clue"]: (clueObject: {
    value: number;
    arrayIndex: number;
    clueIndex: number;
    roomId: string;
    userId: string;
  }) => void;
  ["Host modifies the score"]: (playerObject: {
    socket: string;
    name: string;
    score: number;
    roomId: string;
  }) => void;
  ["Host activates the buzzers"]: (roomId: string) => void;
  ["A player hits the buzzer"]: (
    roomId: string,
    clientTimeStamp: number
  ) => void;
  ["A player with a button hits the buzzer"]: (
    playerName: string,
    roomId: string
  ) => void;
  ["No player knows the answer"]: (
    clueObject: {
      arrayIndex: number;
      clueIndex: number;
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
  ["User gets updated game state"]: (roomId: string) => void;
  ["Host changes the game"]: (
    gameName: string,
    players: Players | undefined,
    roomId: string,
    userId: string
  ) => void;
  ["Host adds a team with a button"]: (
    teamObject: {
      name: string;
      keys: string[];
      ping: number;
      score: number;
      socketId: string;
    }[],
    roomId: string
  ) => void;
  ["Team selects a daily double clue"]: (
    roomId: string,
    socketId: string
  ) => void;
  ["update player score manually"]: (
    socketId: string,
    score: number,
    roomId: string
  ) => void;
  ["buzzer hit pong"]: (
    roomId: string,
    ping: number,
    serverTimeStamp: number
  ) => void;
}
