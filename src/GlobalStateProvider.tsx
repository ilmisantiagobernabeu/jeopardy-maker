import React, { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Clue, GameState } from "../stateTypes";

interface Player {
  [name: string]: number;
}

interface ServerToClientEvents {
  ["gameState updated"]: (gameStateFromServer: GameState) => void;
  ["play correct sound"]: () => void;
  ["play incorrect sound"]: () => void;
  ["player successfully added to game"]: () => void;
}

type DailyDoubleObject = {
  dailyDoubleAmount: number;
  arrayIndex: number;
  clueText: string;
};

interface ClientToServerEvents {
  ["counter clicked"]: (socketId: string) => void;
  ["new player joined"]: (playerName?: string | null) => void;
  ["a player disconnected"]: () => void;
  ["give updated game state"]: () => void;
  ["player signed up"]: (playerName: string) => void;
  ["A player answers the clue"]: (clueObject: {
    value: number;
    arrayIndex: number;
    clueText?: string;
  }) => void;
  ["Host activates the buzzers"]: () => void;
  ["A player hits the buzzer"]: () => void;
  ["No player knows the answer"]: (clueObject: {
    arrayIndex: number;
    clueText: string;
  }) => void;
  ["Host selects a clue"]: (clueObject: Clue) => void;
  ["Host navigates to another round"]: (round: number) => void;
  ["A player sets daily double wager"]: (
    dailyDoubleObject: DailyDoubleObject
  ) => void;
}

export type ContextType = {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  setSocket: any;
};

const GlobalStateContext = React.createContext<ContextType | null>(
  null
) as React.Context<ContextType>;

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    // connect to the socket server
    setSocket(io("ws://192.168.0.18:5000"));
  }, []);

  useEffect(() => {
    // when connected, look for when the server emits the updated game state
    socket?.on("gameState updated", function (gameStateFromServer: GameState) {
      // set the new game state on the client
      setGameState(gameStateFromServer);
    });

    socket?.on("connect", () => {
      socket?.emit("new player joined", localStorage.getItem("dt-playerName"));
    });

    socket?.on("disconnect", () => {
      socket?.emit("a player disconnected");
    });
  }, [socket]);

  return (
    <GlobalStateContext.Provider
      value={{
        gameState,
        setGameState,
        socket,
        setSocket,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
