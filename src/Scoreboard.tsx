import React from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";

const Scoreboard = () => {
  const { players } = useGlobalState() || {};
  const { name } = useParams();

  const currentPlayerScore = name && players?.[name];

  console.log(name, players, players?.[name!]);

  return (
    <div
      className={cx(
        "flex w-full h-full fixed top-0 left-0 justify-center items-center flex-col",
        {
          "bg-teal-500": currentPlayerScore !== undefined,
        }
      )}
    >
      {currentPlayerScore === undefined &&
        players &&
        Object.entries(players).map(([player, score]) => (
          <p className="text-9xl text-white my-4">
            {player}: {score}
          </p>
        ))}
      {currentPlayerScore !== undefined && (
        <p className="text-9xl text-white my-4">{currentPlayerScore}</p>
      )}
    </div>
  );
};

export default Scoreboard;
