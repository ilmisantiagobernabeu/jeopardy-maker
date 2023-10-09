import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "./PageWrapper";

const PlayerJoin = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { gameState, socket } = useGlobalState();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("dt-playerName") || ""
  );
  const previousGameGuid = useRef("");

  const navigate = useNavigate();

  useEffect(() => {
    if (gameState?.guid) {
      // reload page when the game guid changes on the server
      if (
        previousGameGuid.current &&
        previousGameGuid.current !== gameState.guid
      ) {
        location.reload();
      } else {
        previousGameGuid.current = gameState.guid;
      }
    }
  }, [gameState?.guid]);

  function handleSubmission(localPlayerName: string) {
    socket?.emit("player signed up", localPlayerName);
    localStorage.setItem(`dt-${gameState?.guid}-playerName`, localPlayerName);
    localStorage.setItem(`dt-playerName`, localPlayerName);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const otherPlayerNames = Object.values(gameState?.players || {})
      ?.filter((player) => player.name)
      ?.map((player) => player.name);
    if (otherPlayerNames.includes(playerName)) {
      alert("Team name already exists, please pick a new name");
    } else {
      handleSubmission(playerName);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPlayerName(e.target.value);
  }

  useEffect(() => {
    const localName = localStorage.getItem(`dt-${gameState?.guid}-playerName`);

    if (localName) {
      setPlayerName(localName);
      handleSubmission(localName);
    }
  }, [gameState?.guid]);

  useEffect(() => {
    if (socket) {
      socket.on("player successfully added to game", () => {
        navigate("/buzzer");
      });
    }
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
        <div className="flex flex-col gap-4 items-center">
          <label
            htmlFor="playerJoin"
            className="font-bold text-2xl leading-none text-center normal-case"
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
        <div className="flex gap-4 mt-4">
          <button
            className="primary-btn disabled:opacity-40"
            disabled={!playerName.trim()}
          >
            Join Game
          </button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default PlayerJoin;
