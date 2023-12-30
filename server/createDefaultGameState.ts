import { GameState, Players } from "../stateTypes";
import { getPublicGames, getUserGames } from "./models/game";

export const createDefaultGameState = async ({
  newRoomId = "",
  previousRoomId,
  specificGameName,
  previousPlayers,
  userId,
}: Partial<{
  newRoomId: string;
  previousRoomId?: string | null;
  specificGameName?: string;
  previousPlayers?: Players | undefined;
  userId?: string;
}> = {}): Promise<GameState> => {
  const publicGames = userId
    ? await getUserGames(userId)
    : await getPublicGames();

  const gameId = previousRoomId || newRoomId;

  const previousPlayersWithoutScores: Players = Object.fromEntries(
    Object.entries(previousPlayers || {}).map(([guid, player]) => [
      guid,
      {
        ...player,
        score: 0,
      },
    ])
  );

  const selectedGame =
    specificGameName && publicGames[specificGameName]
      ? publicGames[specificGameName]
      : "";

  return {
    name: selectedGame.name,
    games: publicGames,
    game: publicGames[selectedGame.name] || {},
    round: 1,
    guid: gameId,
    isBuzzerActive: false,
    activePlayer: null,
    lastActivePlayer: null,
    dailyDoubleAmount: 0,
    previousClue: null,
    activeClue: null,
    playersThatLeft: [],
    players: previousPlayersWithoutScores || {},
    incorrectGuesses: [],
    history: [],
  };
};
