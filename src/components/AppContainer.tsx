import { Routes, Route } from "react-router-dom";
import App from "./App";
import { useGlobalState } from "./GlobalStateProvider";
import Scoreboard from "./Scoreboard";
import History from "./History";
import PlayerJoin from "./PlayerJoin";
import Homepage from "./Homepage";
import Buzzer from "./Buzzer";
import HostControls from "./HostControls";
import { QRCode } from "./QR";
import CreateGame from "./CreateGame";

const Debug = () => {
  const { gameState } = useGlobalState();

  return <pre className="text-white">{JSON.stringify(gameState, null, 2)}</pre>;
};

const AppContainer = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/answer" element={<HostControls />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/board" element={<App round={1} />} />
        <Route
          path="/board2"
          element={<App round={2} key={window.location.pathname} />}
        />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/buzzer" element={<Buzzer />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/qr" element={<QRCode className="p-12 w-full h-full" />} />
      </Routes>
    </>
  );
};

export default AppContainer;
