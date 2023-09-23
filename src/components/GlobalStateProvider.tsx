import React, { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ButtonColor,
  ClientToServerEvents,
  Clue,
  GameState,
  ServerToClientEvents,
} from "../../stateTypes";

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
    setSocket(io(`ws://${import.meta.env.VITE_STATIC_IP}:5000`));
  }, []);

  useEffect(() => {
    // when connected, look for when the server emits the updated game state
    socket?.on("gameState updated", function (gameStateFromServer: GameState) {
      // set the new game state on the client
      setGameState(gameStateFromServer);
    });

    socket?.on("connect", () => {
      socket?.emit(
        "new player joined",
        localStorage.getItem(`dt-${gameState?.guid}-playerName`)
      );
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
