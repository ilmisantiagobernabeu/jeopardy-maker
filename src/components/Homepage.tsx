import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCode } from "./QR";
import { useGlobalState } from "./GlobalStateProvider";
import PhoneIcon from "../icons/PhoneIcon";
import DesktopIcon from "../icons/DesktopIcon";
import { PageWrapper } from "./PageWrapper";
import EditIcon from "../icons/EditIcon";
import DeleteIcon from "../icons/DeleteIcon";
import { v4 as uuidv4 } from "uuid";
import { RefreshIcon } from "../icons/RefreshIcon";

function generateRandomString(length = 5) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

const Homepage = () => {
  const { gameState, socket } = useGlobalState();

  useEffect(() => {
    if (!localStorage.getItem("bz-roomId")) {
      socket?.emit("Host refreshes the room code", uuidv4().slice(0, 5), null);
    } else {
      socket?.emit(
        "Host reloads the board page",
        localStorage.getItem("bz-roomId") || ""
      );
    }
  }, [socket]);

  // when logged in, find user boards
  useEffect(() => {
    if (gameState?.guid && localStorage.getItem("bz-userId")) {
      socket?.emit(
        "Get user created boards",
        gameState?.guid || "",
        localStorage.getItem("bz-userId") || ""
      );
    }
  }, [socket, gameState?.guid]);

  return (
    <PageWrapper>
      <h1 className="text-7xl font-bold font-korinna gold-text">BUZZINGA</h1>
      <div className="flex gap-16 items-start max-w-4xl flex-col sm:flex-row">
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl leading-none">
            <PhoneIcon width={14} className=" fill-white" /> Teams join{" "}
            <Link
              to={`/join/${localStorage.getItem("bz-roomId")}`}
              className="gold-text hover:underline focus:underline"
            >
              here
            </Link>
          </h2>
          <Link to={`/qr`} target="_blank">
            <QRCode />
          </Link>
          <p className="font-bold text-lg leading-none justify-center flex gap-2">
            Session Name:{" "}
            <span className="text-center gold-text">{gameState?.guid}</span>
            {gameState?.guid && (
              <button
                title="Refresh the session"
                onClick={() => {
                  socket?.emit(
                    "Host refreshes the room code",
                    uuidv4().slice(0, 5),
                    gameState?.guid!
                  );
                }}
              >
                <RefreshIcon width={20} className="text-white" />
              </button>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 font-bold text-2xl leading-none">
            <DesktopIcon width={22} className="fill-white" />
            Select a board
          </h2>
          {Object.keys(gameState?.games || {}).length === 0 ? (
            <p>No existing games found</p>
          ) : (
            <>
              <div>
                <h3 className="font-bold gold-text ">Public boards</h3>
                <ul className="flex flex-col gap-2 list-disc list-inside max-h-52 overflow-auto">
                  {Object.values(gameState?.games || {})
                    .filter((game) => game.isPublic)
                    .map((game, index) => (
                      <li
                        key={game.name + gameState?.guid}
                        className="flex gap-6"
                      >
                        <button
                          onClick={() => {
                            socket?.emit(
                              "Host changes the game",
                              game.name,
                              gameState?.players,
                              gameState?.guid || "",
                              localStorage.getItem("bz-userId") || ""
                            );
                            localStorage.setItem("dt-gameName", game.name);
                            window.open(`/board?game=${game.name}`, "_blank");
                          }}
                          className="hover:text-gold focus:text-gold font-semibold transition-colors duration-200 text-left flex-grow"
                        >
                          &bull; {game.name}
                        </button>
                        {game.userId === localStorage.getItem("bz-userId") && (
                          <div className="flex gap-3">
                            <Link
                              to={`/create?name=${game.name}`}
                              className="flex justify-center items-center hover:text-gold focus:text-gold"
                            >
                              <EditIcon width={16} height={16} />
                            </Link>
                            <button
                              className="flex justify-center items-center disabled:opacity-50 hover:text-gold focus:text-gold"
                              onClick={() => {
                                const response = confirm(
                                  `Are you sure you want to delete ${game.name}?`
                                );

                                if (response) {
                                  socket?.emit(
                                    "delete a game",
                                    game.name,
                                    gameState?.guid || ""
                                  );
                                }
                              }}
                            >
                              <DeleteIcon height={18} />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
              {localStorage.getItem("bz-session") &&
                Object.values(gameState?.games || {}).filter(
                  (game) => !game.isPublic
                ).length > 0 && (
                  <div>
                    <h3 className="font-bold gold-text">Your boards</h3>
                    <ul className="flex flex-col gap-2 list-disc list-inside max-h-52 overflow-auto">
                      {Object.values(gameState?.games || {})
                        .filter((game) => !game.isPublic)
                        .map((game) => (
                          <li
                            key={game.name + gameState?.guid}
                            className="flex gap-6"
                          >
                            <button
                              onClick={() => {
                                socket?.emit(
                                  "Host changes the game",
                                  game.name,
                                  gameState?.players,
                                  gameState?.guid || "",
                                  localStorage.getItem("bz-userId") || ""
                                );
                                localStorage.setItem("dt-gameName", game.name);
                                window.open(
                                  `/board?game=${game.name}`,
                                  "_blank"
                                );
                              }}
                              className="hover:text-gold focus:text-gold font-semibold transition-colors duration-200 text-left flex-grow"
                            >
                              &bull; {game.name}
                            </button>
                            <div className="flex gap-3">
                              <Link
                                to={`/create?name=${game.name}`}
                                className="flex justify-center items-center hover:text-gold focus:text-gold"
                              >
                                <EditIcon width={16} height={16} />
                              </Link>
                              <button
                                className="flex justify-center items-center disabled:opacity-50 hover:text-gold focus:text-gold"
                                onClick={() => {
                                  const response = confirm(
                                    `Are you sure you want to delete ${game.name}?`
                                  );

                                  if (response) {
                                    socket?.emit(
                                      "delete a game",
                                      game.name,
                                      gameState?.guid || ""
                                    );
                                  }
                                }}
                                disabled={game.name === "history-101"}
                              >
                                <DeleteIcon height={18} />
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

              <p className="relative text-center before:border-b before:border-white before:w-full before:absolute before:h-1 before:left-0 before:top-2">
                <span className="bg-red relative z-10 bg-[#060ce9] px-2 italic">
                  OR
                </span>
              </p>
            </>
          )}

          <p>
            <Link
              to={`/create/${
                gameState?.guid
              }?name=default-game-${generateRandomString()}`}
              className="primary-btn"
            >
              Create new board
            </Link>
          </p>
        </div>
      </div>
      {Object.entries(gameState?.players || {})?.filter(
        ([_, player]) => player.name
      ).length > 0 && (
        <div className="flex flex-col gap-8 text-center">
          <h2 className="font-bold text-2xl leading-none">Teams ready to go</h2>
          <div className="flex justify-center gap-6">
            {Object.entries(gameState?.players || {})
              ?.filter(([_, player]) => player.name)
              .map(([_, player]) => (
                <div key={player.name} className="flex items-center gap-2">
                  <PhoneIcon width={14} />
                  {player.name}
                </div>
              ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Homepage;
