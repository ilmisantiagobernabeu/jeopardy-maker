import { Routes, Route } from "react-router-dom";
import App from "./App";
import { useGlobalState } from "./GlobalStateProvider";
import Scoreboard from "./Scoreboard";
import PlayerJoin from "./PlayerJoin";
import Homepage from "./Homepage";
import Buzzer from "./Buzzer";
import HostControls from "./HostControls";

const Debug = () => {
  const { gameState } = useGlobalState();

  return <div className="text-white">{JSON.stringify(gameState)}</div>;
};

const AppContainer = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/answer" element={<HostControls />} />
        <Route path="/game" element={<App round={1} />} />
        <Route path="/game2" element={<App round={2} />} />
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
