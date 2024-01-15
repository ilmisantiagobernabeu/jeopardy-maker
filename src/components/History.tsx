import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import { HistoryPlayer } from "../../stateTypes";
import { PageWrapper } from "./PageWrapper";

const History = () => {
  const { gameState, socket } = useGlobalState() || {};
  const { name } = useParams();

  const handleUndo = (player: HistoryPlayer) => {
    socket?.emit("Host modifies the score", {
      name: player.name,
      socket: player.socket,
      score: player.score * -2,
      roomId: localStorage.getItem("bz-roomId") || "",
    });
  };

  const teamHistory = gameState?.history.sort((a, b) =>
    a.timeStamp > b.timeStamp ? -1 : 1
  );

  return (
    <PageWrapper>
      <div className="GameCard">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          History
        </h2>
        {teamHistory?.length ? (
          <div className="text-center flex gap-20 flex-wrap" key={name}>
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
                {teamHistory?.map((player, index) => (
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
                        className="w-full primary-btn"
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
        ) : (
          <p className="normal-case text-lg">
            A play-by-play of team scores will appear once a game has begun.
          </p>
        )}
      </div>
    </PageWrapper>
  );
};

export default History;
