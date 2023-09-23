import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import { useState } from "react";
import { ButtonColor } from "../../stateTypes";
import { PageWrapper } from "./PageWrapper";

const Teams = () => {
  const { gameState, socket } = useGlobalState() || {};
  const { name } = useParams();
  const [playerName, setPlayerName] = useState("");
  const [color, setColor] = useState<ButtonColor | "">("");

  const playersWithButtons = Object.values(gameState?.players || {}).filter(
    (player) => player.name && player.color
  );

  const addPlayer = () => {
    socket?.emit("Host adds a team with a button", {
      playerName,
      color,
    });

    // reset state
    setPlayerName("");
    setColor("");
  };

  return (
    <PageWrapper>
      <div className="GameCard flex flex-col gap-4">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          Add Teams with Physical Buttons
        </h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="min-w-max rounded-sm p-3 text-black"
            placeholder="Team name"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
            }}
            disabled={playersWithButtons.length === 3}
          />
          <div className="flex gap-1 text-xl">
            <button
              disabled={
                !!playersWithButtons.find((player) => player.color === "green")
              }
              onClick={() => {
                setColor("green");
              }}
              className={cx(
                "rounded-full border-2 border-transparent hover:border-white focus:border-white disabled:opacity-50",
                {
                  "border-2": color === "green",
                }
              )}
              title="Shift+Ctrl+1"
            >
              🟢
            </button>
            <button
              disabled={
                !!playersWithButtons.find((player) => player.color === "yellow")
              }
              onClick={() => {
                setColor("yellow");
              }}
              className={cx(
                "rounded-full border-2 border-transparent hover:border-white focus:border-white disabled:opacity-50",
                {
                  "border-2": color === "yellow",
                }
              )}
              title="Shift+Ctrl+2"
            >
              🟡
            </button>
            <button
              disabled={
                !!playersWithButtons.find((player) => player.color === "red")
              }
              onClick={() => {
                setColor("red");
              }}
              className={cx(
                "rounded-full border-2 border-transparent hover:border-white focus:border-white disabled:opacity-50",
                {
                  "border-2": color === "red",
                }
              )}
              title="Shift+Ctrl+3"
            >
              🔴
            </button>
          </div>
          <button
            className="primary-btn"
            onClick={addPlayer}
            disabled={!playerName || !color}
          >
            Add
          </button>
        </div>
        {playersWithButtons.length > 0 && (
          <div className=" text-center flex flex-wrap" key={name}>
            <table className="text-left text-xl w-full" cellPadding={10}>
              <thead className="border-b">
                <tr>
                  <th>Name</th>
                  <th>Color</th>
                </tr>
              </thead>
              <tbody>
                {playersWithButtons.map((player) => (
                  <tr
                    key={player.name?.toString()}
                    className="even:bg-gray-900 even:!bg-opacity-30 "
                  >
                    <td>{player.name}</td>
                    <td>{player.color || "No color"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Teams;
