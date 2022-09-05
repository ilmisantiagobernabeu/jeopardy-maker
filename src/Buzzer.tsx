import React from "react";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";

const Buzzer = () => {
  const { socket, gameState } = useGlobalState();

  const handleClick = () => {
    console.log("wtf handle click broooo", socket);
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
        {/* {socket?.id} */}
      </button>
    </div>
  );
};

export default Buzzer;
