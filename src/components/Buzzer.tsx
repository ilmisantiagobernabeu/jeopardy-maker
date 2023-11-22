import React, { useEffect, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import buzzerSound from "../sounds/buzzer.mp3";
import { useNavigate, useParams } from "react-router-dom";
import CloseIcon from "../icons/CloseIcon";
import { requestScreenWakeLock } from "../hooks/requestScreenWakeLock";

const Buzzer = () => {
  const { roomId } = useParams();
  const { socket, gameState } = useGlobalState();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleClick = () => {
    const sound = new Audio(buzzerSound);
    sound.play();
    socket?.emit("A player hits the buzzer", roomId || "");
  };

  const isActivePlayer =
    gameState?.activePlayer && gameState?.activePlayer === socket!.id;

  // Disable the button if:
  // 1. the buzzer hasn't been activated by the host
  // 2. the buzzer HAS been activated, but it's not the current player.
  const disabled = Boolean(
    !gameState?.isBuzzerActive ||
      (gameState?.isBuzzerActive && isActivePlayer) ||
      gameState?.incorrectGuesses.includes(socket!.id)
  );

  const hasDisconnected = !gameState?.players?.[socket?.id || ""];

  useEffect(() => {
    window.addEventListener("visibilitychange", () => {
      window.location.reload();
    });
  }, []);

  useEffect(() => {
    if (hasDisconnected && roomId) {
      navigate(`/join/${roomId}`);
    }
  }, [hasDisconnected]);

  return (
    <div className="fixed inset-0 h-full w-full bg-white font-korinna">
      <button
        onClick={() => {
          requestScreenWakeLock();
          setShowModal(false);
        }}
        className={cx(
          "fixed inset-0 h-full w-full bg-[#060ce9] z-10 text-white text-3xl",
          {
            "-translate-x-full": !showModal,
          }
        )}
      >
        Tap screen to show buzzer
      </button>

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
        {disabled && !isActivePlayer && (
          <CloseIcon className="w-full h-full p-12" />
        )}
      </button>
      <div className="fixed top-0 w-full left-0 text-center pt-10 text-6xl pointer-events-none">
        <p className="text-6xl uppercase font-semibold">
          Team {gameState?.players?.[socket?.id || ""]?.name}
        </p>
      </div>
      <ul className="fixed bottom-0 w-full left-0 pb-10 text-2xl px-4 pointer-events-none">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl leading-none">Scoreboard</h2>
          {Object.entries(gameState?.players || {})
            .filter(([s, player]) => player.name)
            .sort((a, b) => (a[1].score > b[1].score ? -1 : 1))
            .map(([s, { name, score }], index) => (
              <li key={name} className="flex justify-between w-full">
                <span>
                  {name} {index === 0 ? "👑" : ""}
                </span>{" "}
                <span>{score}</span>
              </li>
            ))}
        </div>
      </ul>
    </div>
  );
};

export default Buzzer;
