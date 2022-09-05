import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import App from "./App";
import useNoSleep from "use-no-sleep";
import GlobalStateProvider, { useGlobalState } from "./GlobalStateProvider";
import { GameState } from "../stateTypes";
import Scoreboard from "./Scoreboard";
import PlayerJoin from "./PlayerJoin";
import Buzzer from "./Buzzer";

const Debug = () => {
  const { gameState } = useGlobalState();

  return <div className="text-white">{JSON.stringify(gameState)}</div>;
};

const AppContainer = () => {
  useNoSleep(true);

  const { gameState, setGameState, socket } = useGlobalState();

  function handleClick() {
    socket?.emit("counter clicked", socket.id);
  }

  return (
    <>
      {/* <button onClick={handleClick} className="text-white">
        State: {JSON.stringify(gameState)}
      </button> */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/buzzer" element={<Buzzer />} />
        <Route path="/debug" element={<Debug />} />
      </Routes>
    </>
  );
};

export default AppContainer;
