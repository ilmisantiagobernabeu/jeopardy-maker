import React, { useEffect, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import { useNavigate } from "react-router-dom";

const PlayerJoin = () => {
  const { gameState, socket } = useGlobalState();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("dt-playerName") || ""
  );

  const navigate = useNavigate();

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

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 w-full h-full flex-col flex items-center justify-center p-8"
    >
      <style>
        {`body {
          background-color: #060ce9;
        }`}
      </style>
      <div className="flex flex-col gap-4 items-center">
        <label
          htmlFor="playerJoin"
          className="flex items-center gap-2 font-bold text-2xl leading-none text-white"
        >
          Select a team name
        </label>
        <input
          id="playerJoin"
          type="text"
          placeholder="Team Name"
          className="w-full max-w-lg px-4 py-2"
          value={playerName}
          onChange={handleChange}
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
  );
};

export default PlayerJoin;
