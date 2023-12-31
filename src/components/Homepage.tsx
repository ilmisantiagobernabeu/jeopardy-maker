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
import { useDeleteUserBoard } from "../api/useDeleteUserBoard";
import { queryClient } from "../main";
import {
  getUserBoardsQueryKey,
  useGetUserBoards,
} from "../api/useGetUserBoards";
import { Loader } from "lucide-react";

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
  const { gameState, socket, session } = useGlobalState();
  const { mutate: deleteGame } = useDeleteUserBoard({
    onSuccess() {
      queryClient.invalidateQueries([getUserBoardsQueryKey]);
    },
  });

  const { data: userBoards } = useGetUserBoards(session?.user.id || "");

  useEffect(() => {
    if (!localStorage.getItem("bz-roomId")) {
      socket?.emit("Host refreshes the room code", uuidv4().slice(0, 5), null);
    }
  }, [socket]);

  return (
    <PageWrapper>
      <h1 className="text-5xl sm:text-7xl font-bold font-korinna gold-text">
        BUZZINGA
      </h1>
      <div className="flex gap-8 sm:gap-16 items-start justify-center max-w-4xl flex-col sm:flex-row w-full">
        <div className="flex flex-col gap-4 justify-center sm:justify-start w-full sm:w-auto">
          <h2 className="flex items-center justify-center sm:justify-start gap-2 font-bold text-2xl leading-none">
            <PhoneIcon width={14} className=" fill-white" /> Teams join{" "}
            <Link
              to={`/join/${gameState?.guid}`}
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
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full sm:w-auto">
          <h2 className="flex items-center gap-2 font-bold text-2xl leading-none">
            <DesktopIcon width={22} className="fill-white" />
            Host
          </h2>
          {Object.keys(userBoards || {}).length === 0 ? (
            <div className="w-full flex gap-2 justify-center">
              <Loader className="animate-spin" />
              <p className="font-semibold">Loading games...</p>
            </div>
          ) : (
            <>
              <div>
                <h3 className="font-bold gold-text ">Public boards</h3>
                <ul className="flex flex-col gap-2 list-disc list-inside max-h-52 overflow-auto">
                  {Object.values(userBoards || {})
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
                                  deleteGame({
                                    gameName: game.name || "",
                                  });
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
                Object.values(userBoards || {}).filter((game) => !game.isPublic)
                  .length > 0 && (
                  <div>
                    <h3 className="font-bold gold-text">Your boards</h3>
                    <ul className="flex flex-col gap-2 list-disc list-inside max-h-52 overflow-auto">
                      {Object.values(userBoards || {})
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
                              &bull; {game.name.replaceAll("-", " ")}
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
                                    deleteGame({
                                      gameName: game.name || "",
                                    });
                                  }
                                }}
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
              to={`/create?name=default-game-${generateRandomString()}`}
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
