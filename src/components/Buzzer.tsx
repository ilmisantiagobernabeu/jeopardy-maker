import React, { useEffect, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import buzzerSound from "../sounds/buzzer.mp3";
import { requestScreenWakeLock } from "../hooks/requestScreenWakeLock";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";

const Buzzer = () => {
  const { socket, gameState } = useGlobalState();
  const [showModal, setShowModal] = useState(true);
  const [ping, setPing] = useState<number | null>(null);

  useGetUpdatedGameState();

  const handleClick = () => {
    const sound = new Audio(buzzerSound);
    sound.play();
    socket?.emit(
      "A player hits the buzzer",
      localStorage.getItem("bz-roomId") || ""
    );
  };

  useEffect(() => {
    const handlePong = (initialTimeStamp: number) => {
      const newPing = new Date().getTime() - initialTimeStamp;
      setPing(newPing);
      socket?.emit(
        "Set ping of a phone buzzer",
        localStorage.getItem("bz-roomId") || "",
        newPing
      );
    };
    socket?.on("pong", handlePong);
    if (localStorage.getItem("bz-roomId")) {
      socket?.emit("ping", new Date().getTime());
    }

    return () => {
      socket?.off("pong", handlePong);
    };
  }, [socket]);

  useEffect(() => {
    const handleSpacebar = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        handleClick();
      }
    };
    window.addEventListener("keydown", handleSpacebar);

    return () => {
      window.removeEventListener("keydown", handleSpacebar);
    };
  }, []);

  useEffect(() => {
    const handleDisconnect = () => {
      window.location.reload();
    };

    socket?.on("disconnect", handleDisconnect);

    return () => {
      socket?.off("disconnect", handleDisconnect);
    };
  }, [socket]);

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

  useEffect(() => {
    const sessionName = localStorage.getItem("bz-roomId") || "";
    socket?.emit(
      "player signed up",
      localStorage.getItem(`dt-${sessionName}-playerName`) || "",
      sessionName
    );
  }, [socket]);

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

      {!showModal && disabled && (
        <button
          className="fixed inset-0 h-full w-full z-10"
          onClick={() => {
            if (socket) {
              socket.emit("ping", new Date().getTime());
            }
          }}
        ></button>
      )}

      <button
        type="button"
        className={cx(
          "fixed font-bold inset-0 h-full w-full leading-none color-white appearance-none",
          {
            "bg-red-500": !isActivePlayer,
            "bg-opacity-50": disabled,
            "bg-green-500": isActivePlayer,
          }
        )}
        disabled={disabled}
        onClick={handleClick}
      >
        {disabled && !gameState?.activePlayer && (
          <p className="text-3xl">Buzzer deactivated</p>
        )}
        {!disabled && !isActivePlayer && (
          <p className="text-3xl">
            Buzzer activated!
            <span className="block text-lg">(Spacebar)</span>
          </p>
        )}
        {gameState?.activePlayer && (
          <p className="text-3xl">
            Buzzed in:{" "}
            {isActivePlayer
              ? "YOU"
              : gameState?.players?.[gameState.activePlayer || ""]?.name}
            !
          </p>
        )}
      </button>
      <div className="fixed top-0 w-full left-0 text-center pt-10 text-6xl pointer-events-none">
        <p className="text-6xl uppercase font-semibold">
          Team {gameState?.players?.[socket?.id || ""]?.name}
        </p>
        <p className="text-sm">
          Session Name:{" "}
          <span className="font-semibold">
            {localStorage.getItem("bz-roomId")}
          </span>
        </p>
        <p className="text-sm">
          Ping: <span className="font-semibold">{ping}ms</span>
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
