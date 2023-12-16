import { useEffect, useState } from "react";
import { useGlobalState } from "../components/GlobalStateProvider";
import buzzerSound from "../sounds/buzzer.mp3";

export const useBuzzers = () => {
  const [teamBuzzedIn, setTeamBuzzedIn] = useState("");
  const { gameState, socket } = useGlobalState();
  const playersWithButtons = Object.values(gameState?.players || {}).filter(
    (player) => Boolean(player.name && player?.keys?.length)
  );

  // Logic for physical buttons
  useEffect(() => {
    if (playersWithButtons.length === 0) {
      return;
    }

    let keyState: { [key: string]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      // Track the key state
      keyState[event.key] = true;

      playersWithButtons.forEach((player) => {
        // Check if all keys for the current player are pressed
        const allKeysPressed = player?.keys?.every((key) => keyState[key]);
        const playerName = player.name || "";

        if (allKeysPressed) {
          // Do something for the current player
          const sound = new Audio(buzzerSound);
          sound.play();
          setTeamBuzzedIn(playerName);
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

  return { teamBuzzedIn };
};
