import React, { useContext, useState } from "react";
import { GameState } from "../stateTypes";

interface Player {
  [name: string]: number;
}

export type ContextType = {
  players: Player;
  setPlayers: React.Dispatch<
    React.SetStateAction<{
      "Team 1": number;
      "Team 2": number;
      "Team 3": number;
    }>
  >;
  activePlayer: string;
  setActivePlayer: React.Dispatch<React.SetStateAction<string>>;
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
};

const GlobalStateContext = React.createContext<ContextType | null>(
  null
) as React.Context<ContextType>;

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [players, setPlayers] = useState({
    "Team 1": 0,
    "Team 2": 0,
    "Team 3": 0,
  });
  const [activePlayer, setActivePlayer] = useState("Team 1");
  const [gameState, setGameState] = useState<GameState | null>(null);

  return (
    <GlobalStateContext.Provider
      value={{
        players,
        setPlayers,
        activePlayer,
        setActivePlayer,
        gameState,
        setGameState,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
