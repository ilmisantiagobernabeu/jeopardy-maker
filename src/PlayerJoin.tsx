import React, { EventHandler, useEffect, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import { io, Socket } from "socket.io-client";
import { GameState } from "../stateTypes";
import { useNavigate } from "react-router-dom";
// import { socket } from "./socket";

const PlayerJoin = () => {
  const { gameState, setGameState, socket, setSocket } = useGlobalState();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("dt-playerName") || ""
  );

  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    socket?.emit("player signed up", playerName);
    localStorage.setItem("dt-playerName", playerName);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPlayerName(e.target.value);
  }

  useEffect(() => {
    if (socket) {
      socket.on("player successfully added to game", () => {
        navigate("/buzzer");
      });
      socket.on("existing player returned", () => {
        navigate("/buzzer");
      });
    }
  }, [socket]);

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 w-full h-full flex-col flex items-center justify-center p-8"
    >
      <label htmlFor="playerJoin" className="text-white mb-2 text-3xl">
        Select a team name
      </label>
      <input
        id="playerJoin"
        type="text"
        placeholder="Team Name"
        className="w-full max-w-lg p-4"
        value={playerName || localStorage.getItem("dt-playerName") || undefined}
        onChange={handleChange}
      />
      <div className="flex gap-4 mt-4">
        <button className="bg-white p-1 appearance-none">Join Game</button>
        {/* <button onClick={handleClick} className="bg-white p-1 appearance-none">
          State: {JSON.stringify(gameState)}
        </button> */}
      </div>
    </form>
  );
};

export default PlayerJoin;
