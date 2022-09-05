import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import { GameState } from "../stateTypes";

const Scoreboard = () => {
  const { gameState } = useGlobalState() || {};
  const { name } = useParams();

  // if a user goes to /scoreboard/[team name], let's show just their score
  const singlePlayerStats =
    name &&
    gameState?.players &&
    Object.values(gameState.players).filter(
      ({ name: playerName }) => name === playerName
    )[0];

  return (
    <div
      className={cx(
        "flex w-full h-full fixed top-0 left-0 justify-center items-center flex-col",
        {
          "bg-teal-500": singlePlayerStats,
        }
      )}
    >
      {!singlePlayerStats &&
        gameState?.players &&
        Object.values(gameState.players)
          .filter(({ name }) => name)
          .map(({ score, name }, index) => (
            <div key={name + index}>
              <p className="text-9xl text-white my-4">
                {name}: {score}
              </p>
            </div>
          ))}
      {singlePlayerStats && (
        <div key={name}>
          <p className="text-9xl text-white my-4">
            {singlePlayerStats.name}: {singlePlayerStats.score}
          </p>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
