import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import App from "./App";
import useNoSleep from "use-no-sleep";
import GlobalStateProvider from "./GlobalStateProvider";
import Scoreboard from "./Scoreboard";
import { io, Socket } from "socket.io-client";
// import { socket } from "./socket";

interface GameObject {
  count: number;
}

interface GameState {
  [socketId: string]: GameObject;
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  ["gameState updated"]: (gameStateFromServer: GameState) => void;
}

interface ClientToServerEvents {
  ["counter clicked"]: (socketId: string) => void;
  ["new player joined"]: () => void;
  ["a player disconnected"]: () => void;
}

// storing socket connection in this global variable
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

const AppContainer = () => {
  useNoSleep(true);

  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // connect to the socket server
    socket = io("ws://localhost:5000");

    // when connected, look for when the server emits the updated count
    socket.on("gameState updated", function (gameStateFromServer: GameState) {
      // set the new count on the client
      setGameState(gameStateFromServer);
    });

    socket.on("connect", () => {
      socket?.emit("new player joined");
    });

    function cleanup() {
      socket?.emit("a player disconnected");
    }

    socket.on("disconnect", () => {
      cleanup();
    });

    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.addEventListener("beforeunload", cleanup);
    };
  }, []);

  function handleClick() {
    socket?.emit("counter clicked", socket.id);
  }

  return (
    <GlobalStateProvider>
      <button onClick={handleClick} className="text-white">
        State: {JSON.stringify(gameState)}
      </button>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="wtf" element={<Scoreboard />} />
      </Routes>
    </GlobalStateProvider>
  );
};

export default AppContainer;
