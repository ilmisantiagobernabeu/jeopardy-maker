import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import App from "./App";
import useNoSleep from "use-no-sleep";
import GlobalStateProvider from "./GlobalStateProvider";
import Scoreboard from "./Scoreboard";

const AppContainer = () => {
  useNoSleep(true);
  return (
    <GlobalStateProvider>
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
