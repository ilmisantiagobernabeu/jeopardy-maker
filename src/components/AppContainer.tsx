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
import buzzerSound from "../sounds/buzzer.mp3";
import { Debug } from "./Debug";
import { Login } from "../features/login/Login";
import { Admin } from "./Admin";
import { Contact } from "./Contact";
import { Settings } from "./Settings";
import { RequireAuth } from "./RequireAuth";

const AppContainer = () => {
  const { gameState, socket } = useGlobalState();

  const playersWithButtons = Object.values(gameState?.players || {}).filter(
    (player) => Boolean(player.name && player?.keys?.length)
  );

  // Logic for physical buttons
  useEffect(() => {
    if (playersWithButtons.length === 0) {
      return;
    }

    // Disable the button if:
    // 1. the buzzer hasn't been activated by the host
    // 2. the buzzer HAS been activated, but it's not the current player.
    const isDisabled = (playerName: string) => {
      const isActivePlayer =
        gameState?.activePlayer && gameState?.activePlayer === playerName;

      return Boolean(
        !gameState?.isBuzzerActive ||
          (gameState?.isBuzzerActive && isActivePlayer) ||
          gameState?.incorrectGuesses.includes(playerName)
      );
    };

    let keyState: { [key: string]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      // Track the key state
      keyState[event.key] = true;

      playersWithButtons.forEach((player) => {
        // Check if all keys for the current player are pressed
        const allKeysPressed = player?.keys?.every((key) => keyState[key]);
        const playerName = player.name || "";

        if (allKeysPressed && !isDisabled(playerName)) {
          // Do something for the current player
          console.log(`${player.name} buzzed in!`);
          const sound = new Audio(buzzerSound);
          sound.play();
          socket?.emit(
            "A player with a button hits the buzzer",
            playerName,
            gameState?.guid || ""
          );
        }
      });
    };

    function handleKeyUp(): void {
      // Empty the key state
      keyState = {};
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, socket, playersWithButtons]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/answer" element={<HostControls />} />
        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreateGame />
            </RequireAuth>
          }
        />
        <Route path="/board" element={<App />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/scoreboard/:name" element={<Scoreboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/join/:roomId" element={<PlayerJoin />} />
        <Route path="/join" element={<PlayerJoin />} />
        <Route path="/buzzer" element={<Buzzer />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/qr" element={<QRCode className="p-12 w-full h-full" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAuth requiresAdmin>
              <Admin />
            </RequireAuth>
          }
        />
        <Route path="/private" element={<CreateGame />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
};

export default AppContainer;
