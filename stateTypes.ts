export interface GameObject {
  count: number;
}

export interface GameState {
  [socketId: string]: GameObject;
}
