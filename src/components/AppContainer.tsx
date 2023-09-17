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
import { useEffect } from "react";
import Teams from "./Teams";
import { ButtonColor } from "../../stateTypes";

const Debug = () => {
  const { gameState } = useGlobalState();

  return <pre className="text-white">{JSON.stringify(gameState, null, 2)}</pre>;
};

const AppContainer = () => {
  const { gameState, socket } = useGlobalState();

  useEffect(() => {
    // Disable the button if:
    // 1. the buzzer hasn't been activated by the host
    // 2. the buzzer HAS been activated, but it's not the current player.
    const isDisabled = (color: ButtonColor) => {
      const isActivePlayer =
        gameState?.activePlayer && gameState?.activePlayer === color;

      return Boolean(
        !gameState?.isBuzzerActive ||
          (gameState?.isBuzzerActive && isActivePlayer) ||
          gameState?.incorrectGuesses.includes(color)
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !isDisabled("green") &&
        event.shiftKey &&
        event.ctrlKey &&
        event.code === "Digit1"
      ) {
        console.log("Shift + Ctrl + 1");

        socket?.emit("A player with a button hits the buzzer", "green");
        return;
      }

      if (
        !isDisabled("yellow") &&
        event.shiftKey &&
        event.ctrlKey &&
        event.code === "Digit2"
      ) {
        console.log("Shift + Ctrl + 2");
        socket?.emit("A player with a button hits the buzzer", "yellow");
        return;
      }

      if (
        !isDisabled("red") &&
        event.shiftKey &&
        event.ctrlKey &&
        event.code === "Digit3"
      ) {
        console.log("Shift + Ctrl + 3");
        socket?.emit("A player with a button hits the buzzer", "red");
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, socket]);

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
        <Route path="/teams" element={<Teams />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/buzzer" element={<Buzzer />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/qr" element={<QRCode className="p-12 w-full h-full" />} />
      </Routes>
    </>
  );
};

export default AppContainer;
