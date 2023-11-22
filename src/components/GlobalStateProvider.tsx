import React, { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  GameState,
  ServerToClientEvents,
} from "../../stateTypes";
import { SOCKET_SERVER_URL } from "../api/constants";

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
    setSocket(io(SOCKET_SERVER_URL));
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    // listen for when the server emits the updated game state
    socket?.on("gameState updated", function (gameStateFromServer: GameState) {
      // set the new game state on the client
      setGameState(gameStateFromServer);
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
