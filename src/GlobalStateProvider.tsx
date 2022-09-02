import React, { useContext, useState } from "react";

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
};

const GlobalStateContext = React.createContext<ContextType | null>(null);

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

  return (
    <GlobalStateContext.Provider
      value={{ players, setPlayers, activePlayer, setActivePlayer }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
