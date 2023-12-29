import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import { useNavigate, useParams } from "react-router-dom";
import { PageWrapper } from "./PageWrapper";
import { requestScreenWakeLock } from "../hooks/requestScreenWakeLock";

const PlayerJoin = () => {
  const { roomId } = useParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { gameState, socket } = useGlobalState();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("dt-playerName") || ""
  );
  const [sessionName, setSessionName] = useState(roomId || "");

  const navigate = useNavigate();

  function handleSubmission(localPlayerName: string) {
    socket?.emit("player signed up", localPlayerName.trim(), sessionName || "");
    localStorage.setItem(
      `dt-${sessionName}-playerName`,
      localPlayerName.trim()
    );
    localStorage.setItem(`dt-playerName`, localPlayerName.trim());
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    requestScreenWakeLock();

    const otherPlayerNames = Object.values(gameState?.players || {})?.map(
      (player) => player.name
    );
    if (otherPlayerNames.includes(playerName)) {
      alert("Team name already exists, please pick a new name");
    } else {
      handleSubmission(playerName);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPlayerName(e.target.value);
  }

  function handleSessionChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSessionName(e.target.value);
  }

  useEffect(() => {
    const goToBuzzer = () => {
      navigate("/buzzer");
    };
    socket?.on("player successfully added to game", goToBuzzer);

    return () => {
      socket?.off("player successfully added to game", goToBuzzer);
    };
  }, [socket]);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  return (
    <PageWrapper hideMenu>
      <form onSubmit={handleSubmit}>
        <style>
          {`body {
          background-color: #060ce9;
        }`}
        </style>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <label
              htmlFor="sessionName"
              className="font-bold text-2xl leading-none normal-case"
            >
              Session name
            </label>
            <input
              id="sessionName"
              type="text"
              placeholder="e.g. abcde"
              className="w-full max-w-lg px-4 py-2 text-black"
              value={sessionName}
              onChange={handleSessionChange}
            />
          </div>
          <div className="flex flex-col gap-4">
            <label
              htmlFor="playerJoin"
              className="font-bold text-2xl leading-none normal-case"
            >
              Select a team name
            </label>
            <input
              id="playerJoin"
              type="text"
              placeholder="Team Name"
              className="w-full max-w-lg px-4 py-2 text-black"
              value={playerName}
              onChange={handleChange}
              ref={inputRef}
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <button
              className="primary-btn disabled:opacity-40"
              disabled={!playerName.trim() || sessionName.trim().length !== 5}
            >
              Join Game
            </button>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
};

export default PlayerJoin;
