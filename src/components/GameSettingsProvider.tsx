import React, { useContext, useReducer, useState } from "react";

type SettingsState = {
  countdownTimeToAnswer: number;
  audioClueDelay: number;
  imageClueDelay: number;
};

export type SettingsContextType = {
  settingsState: SettingsState;
  setSettingsState: React.Dispatch<React.SetStateAction<SettingsState>>;
};

const GameSettingsContext = React.createContext<SettingsContextType | null>(
  null
) as React.Context<SettingsContextType>;

export const useGameSettings = () => {
  return useContext(GameSettingsContext);
};

const GameSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const initialSettingsState = {
    countdownTimeToAnswer: 25,
    audioClueDelay: 3,
    imageClueDelay: 0,
  };
  const [settingsState, setSettingsState] = useState<SettingsState>(
    localStorage.getItem("bz-gameSettings")
      ? {
          ...initialSettingsState,
          ...JSON.parse(localStorage.getItem("bz-gameSettings") || ""),
        }
      : initialSettingsState
  );

  return (
    <GameSettingsContext.Provider
      value={{
        settingsState,
        setSettingsState,
      }}
    >
      {children}
    </GameSettingsContext.Provider>
  );
};

export default GameSettingsProvider;
