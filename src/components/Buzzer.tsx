import React, { useEffect, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import buzzerSound from "../sounds/buzzer.mp3";
import { requestScreenWakeLock } from "../hooks/requestScreenWakeLock";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";

const Buzzer = () => {
  const { socket, gameState } = useGlobalState();
  const [showModal, setShowModal] = useState(true);

  useGetUpdatedGameState();

  const handleClick = () => {
    const sound = new Audio(buzzerSound);
    sound.play();
    socket?.emit(
      "A player hits the buzzer",
      localStorage.getItem("bz-roomId") || "",
      new Date().getTime()
    );
  };

  useEffect(() => {
    const handleBuzzerPing = (
      clientTimeStamp: number,
      serverTimeStamp: number
    ) => {
      const newPing = new Date().getTime() - clientTimeStamp;
      socket?.emit(
        "buzzer hit pong",
        localStorage.getItem("bz-roomId") || "",
        newPing,
        serverTimeStamp
      );
    };
    socket?.on("buzzer hit ping", handleBuzzerPing);

    return () => {
      socket?.off("buzzer hit ping", handleBuzzerPing);
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

  const teamIsConnected = gameState?.players?.[socket?.id || ""]?.name;

  // Disable the button if:
  // 1. the buzzer hasn't been activated by the host
  // 2. the buzzer HAS been activated, but it's not the current player.
  const disabled = Boolean(
    !gameState?.isBuzzerActive ||
      (gameState?.isBuzzerActive && isActivePlayer) ||
      gameState?.incorrectGuesses.includes(socket!.id) ||
      !teamIsConnected
  );

  useEffect(() => {
    const signIn = () => {
      const sessionName = localStorage.getItem("bz-roomId") || "";
      socket?.emit(
        "player signed up",
        localStorage.getItem(`dt-${sessionName}-playerName`) || "",
        sessionName
      );
    };

    socket?.on("connect", signIn);

    return () => {
      socket?.off("connect", signIn);
    };
  }, [socket]);

  const noOneHasGoneYet = gameState?.game.rounds?.[gameState.round - 1]?.every(
    (cat) => cat.clues.every((clue) => !clue.alreadyPlayed)
  );

  const activePlayerName = isActivePlayer
    ? "YOU"
    : gameState?.players?.[gameState.activePlayer || ""]?.name;

  return (
    <div className="fixed inset-0 h-full w-full bg-white font-korinna">
      <button
        onClick={() => {
          requestScreenWakeLock();
          setShowModal(false);
        }}
        className={cx(
          "fixed inset-0 h-full w-full bg-[#060ce9] z-10 text-white text-3xl p-4 transition-transform duration-300 ",
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
          "fixed font-bold inset-0 h-full w-full px-4 leading-none color-white appearance-none",
          {
            "bg-red-500": !isActivePlayer,
            "bg-opacity-50": disabled,
            "bg-green-500": isActivePlayer,
            "!bg-yellow-500": !!gameState?.firstBuzz && !disabled,
          }
        )}
        onClick={handleClick}
      >
        {disabled && !gameState?.activePlayer && !gameState?.firstBuzz ? (
          <p className="flex flex-col items-center text-3xl">
            Buzzer ready!{" "}
            <span className="flex gap-2 text-base">
              Tap anywhere to buzz in
            </span>
          </p>
        ) : !disabled && !isActivePlayer && !gameState?.firstBuzz ? (
          <p className="text-3xl">
            Buzzer activated!
            <span className="block text-lg">(Spacebar)</span>
          </p>
        ) : gameState?.firstBuzz && !disabled ? (
          <p className="text-3xl">Detecting...</p>
        ) : null}

        {gameState?.activePlayer && (
          <>
            <p className="text-3xl">Buzzed in: {activePlayerName}!</p>
            {gameState.secondPlace && (
              <p className="text-lg">
                {activePlayerName} beat {gameState.secondPlace?.name} by:{" "}
                {gameState.secondPlace?.amountInMs}ms
              </p>
            )}
          </>
        )}
      </button>

      <div className="fixed top-0 w-full left-0 text-center pt-10 px-4 text-6xl pointer-events-none">
        <p className="text-6xl uppercase font-semibold">
          Team {teamIsConnected}
        </p>
        <p className="text-sm">
          Session Name:{" "}
          <span className="font-semibold">
            {localStorage.getItem("bz-roomId")}
          </span>
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
                  {name} {index === 0 ? "👑" : ""}{" "}
                  {gameState?.round === 1 && index === 0 && noOneHasGoneYet
                    ? " (This team goes first!)"
                    : gameState?.round !== 1 &&
                      noOneHasGoneYet &&
                      name ===
                        gameState?.players[gameState?.lastActivePlayer || ""]
                          ?.name
                    ? `(This team goes first in round ${gameState.round})`
                    : undefined}
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
