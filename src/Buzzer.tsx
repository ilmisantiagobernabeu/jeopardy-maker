import React from "react";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import buzzerSound from "./buzzer.mp3";

const Buzzer = () => {
  const { socket, gameState } = useGlobalState();

  const handleClick = () => {
    console.log("wtf handle click broooo", socket);
    const sound = new Audio(buzzerSound);
    sound.play();
    socket?.emit("A player hits the buzzer");
  };

  const isActivePlayer =
    gameState!.activePlayer && gameState!.activePlayer === socket!.id;

  // Disable the button if:
  // 1. the buzzer hasn't been activated by the host
  // 2. the buzzer HAS been activated, but it's not the current player.
  const disabled = Boolean(
    !gameState!.isBuzzerActive ||
      (gameState!.isBuzzerActive && isActivePlayer) ||
      gameState!.incorrectGuesses.includes(socket!.id)
  );

  return (
    <div className="fixed inset-0 h-full w-full bg-white">
      <button
        type="button"
        className={cx(
          "fixed font-bold inset-0 h-full w-full leading-none text-[100vw] color-white appearance-none",
          {
            "bg-red-500 disabled:opacity-40": !isActivePlayer,
            "bg-green-500": isActivePlayer,
          }
        )}
        disabled={disabled}
        onClick={handleClick}
      >
        {isActivePlayer ? "✓" : "×"}
      </button>
      <p className="fixed bottom-0 w-full left-0 text-center pb-10 text-6xl opacity-30">
        {gameState?.players?.[socket?.id || ""]?.name}
      </p>
    </div>
  );
};

export default Buzzer;
