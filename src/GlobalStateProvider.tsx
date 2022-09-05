import React, { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { GameState } from "../stateTypes";
import rightAnswerSound from "./rightanswer.mp3";
import wrongAnswerSound from "./wronganswer.mp3";

interface Player {
  [name: string]: number;
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  ["gameState updated"]: (gameStateFromServer: GameState) => void;
  ["play correct sound"]: () => void;
  ["play incorrect sound"]: () => void;
}

interface ClientToServerEvents {
  ["counter clicked"]: (socketId: string) => void;
  ["new player joined"]: () => void;
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
    setSocket(io("ws://localhost:5000"));
  }, []);

  useEffect(() => {
    // when connected, look for when the server emits the updated game state
    socket?.on("gameState updated", function (gameStateFromServer: GameState) {
      // set the new game state on the client
      setGameState(gameStateFromServer);
    });

    socket?.on("play correct sound", () => {
      const audio = new Audio(rightAnswerSound);
      audio.play();
    });

    socket?.on("play incorrect sound", () => {
      const audio = new Audio(wrongAnswerSound);
      audio.play();
    });

    socket?.on("connect", () => {
      socket?.emit("new player joined");
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
