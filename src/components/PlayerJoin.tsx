import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "./GlobalStateProvider";
import { useNavigate, useParams } from "react-router-dom";
import { PageWrapper } from "./PageWrapper";
import { requestScreenWakeLock } from "../hooks/requestScreenWakeLock";
import { useGetRoom } from "../api/useGetRoom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const PlayerJoin = () => {
  const { roomId } = useParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { gameState, socket } = useGlobalState();
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("dt-playerName") || ""
  );
  const [sessionName, setSessionName] = useState(
    roomId || localStorage.getItem("bz-roomId") || ""
  );
  const { data, isLoading, error } = useGetRoom(
    sessionName,
    sessionName.trim().length === 5
  );

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
      localStorage.setItem("bz-roomId", sessionName);
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="sessionName"
              className="font-bold text-2xl leading-none normal-case dark-text-shadow"
            >
              Session name
            </label>
            <div className="flex flex-col gap-2">
              <input
                id="sessionName"
                type="text"
                placeholder="e.g. abcde"
                className="w-full max-w-lg px-4 py-2 text-black rounded-md"
                value={sessionName}
                onChange={handleSessionChange}
                required
                maxLength={5}
              />
              {!!error ? (
                <p className="flex gap-1 justify-center items-center text-color-error font-semibold rounded-sm px-2 py-0.5 py-13 bg-red-500 text-sm text-center">
                  <AlertTriangle width={16} />{" "}
                  {error?.response?.data.error || "Please try again later."}
                </p>
              ) : data?.message && sessionName.trim().length === 5 ? (
                <p className="flex gap-1 justify-center items-center text-color-error font-semibold rounded-sm px-2 py-0.5 py-13 bg-green-500 text-sm text-center">
                  <CheckCircle2 width={16} /> {data.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="playerJoin"
              className="font-bold text-2xl leading-none normal-case dark-text-shadow"
            >
              Select a team name
            </label>
            <input
              id="playerJoin"
              type="text"
              placeholder="Team Name"
              className="w-full max-w-lg px-4 py-2 text-black rounded-md"
              value={playerName}
              onChange={handleChange}
              ref={inputRef}
              autoFocus
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              className="primary-btn disabled:opacity-40"
              disabled={
                !playerName.trim() ||
                sessionName.trim().length !== 5 ||
                isLoading ||
                !!error ||
                !socket?.connected
              }
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
