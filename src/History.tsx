import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import { HistoryPlayer } from "../stateTypes";

const History = () => {
  const { gameState, socket } = useGlobalState() || {};
  const { name } = useParams();

  const handleUndo = (player: HistoryPlayer) => {
    console.log("ahhhh", player);
    socket?.emit("Host modifies the score", {
      name: player.name,
      socket: player.socket,
      score: player.score * -1,
    });
  };

  return (
    <div
      className={cx(
        "flex w-full h-full fixed top-0 left-0 justify-center items-center flex-col bg-[#060ce9]"
      )}
    >
      <div className="GameCard">
        <div className=" text-center flex gap-20 flex-wrap" key={name}>
          <table className="text-left text-xl" cellPadding={10}>
            <thead className="border-b">
              <tr>
                <th>Player</th>
                <th>Money</th>
                <th>Answer</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {gameState?.history
                .sort((a, b) => (a.timeStamp > b.timeStamp ? -1 : 1))
                .map((player, index) => (
                  <tr
                    key={player.timeStamp.toString()}
                    className="even:bg-gray-900 even:!bg-opacity-30 "
                  >
                    <td>{player.name}</td>
                    <td className="tabular-nums font-mono">
                      {player.answer === "correct" ? "+" : ""}
                      {player.score}
                    </td>
                    <td>{player.answer}</td>
                    <td className="tabular-nums font-mono">
                      {player.totalScore}
                    </td>
                    <td>
                      <button
                        onClick={() => handleUndo(player)}
                        className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                      >
                        Mark as{" "}
                        {player.answer === "correct" ? "incorrect" : "correct"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
