import { useParams } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import cx from "classnames";
import { PageWrapper } from "./PageWrapper";
import EditIcon from "../icons/EditIcon";

function formatScore(score: number) {
  if (score < 0) {
    return `-$${Math.abs(score)}`;
  }

  return `$${score}`;
}

const Scoreboard = () => {
  const { gameState, socket } = useGlobalState() || {};
  const { name } = useParams();

  // if a user goes to /scoreboard/[team name], let's show just their score
  const singlePlayerStats =
    name &&
    gameState?.players &&
    Object.values(gameState.players).filter(
      ({ name: playerName }) => name === playerName
    )[0];

  return (
    <PageWrapper>
      <div className="GameCard">
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          Scores
        </h2>
        {Object.values(gameState?.players || {}).length > 0 ? (
          <div
            className="GameCard-front text-center flex gap-20 flex-wrap"
            key={name}
          >
            {!singlePlayerStats &&
              Object.values(gameState?.players || {})
                .filter(({ name }) => name)
                .sort((a, b) => (a.score > b.score ? -1 : 1))
                .map(({ score, name, socketId }, index) => (
                  <div key={name! + index}>
                    <p className="text-7xl text-white my-4 border-b-4 line-clamp-2">
                      {name}
                    </p>
                    <p
                      className={cx(
                        "text-9xl text-white my-4 flex justify-center items-center gap-4",
                        {
                          "text-red-500": score < 0,
                        }
                      )}
                    >
                      {formatScore(score)}
                      <button
                        onClick={() => {
                          const newScore = prompt(
                            `Enter ${name}'s new score`,
                            score.toString()
                          );
                          const areYouSure = confirm(
                            `Are you sure you want to change ${name}'s score from ${score} to ${newScore}?`
                          );

                          if (areYouSure) {
                            socket?.emit(
                              "update player score manually",
                              socketId,
                              Number(newScore),
                              localStorage.getItem("bz-roomId") || ""
                            );
                          }
                        }}
                      >
                        <EditIcon width={20} />
                      </button>
                    </p>
                  </div>
                ))}
          </div>
        ) : (
          <p className="normal-case text-lg">
            Scores will appear once the teams have joined the game.
          </p>
        )}
      </div>
      {singlePlayerStats && (
        <div className="GameCard">
          <div className="GameCard-front text-center flex-col" key={name}>
            <p className="text-7xl text-white my-4 border-b-4 line-clamp-2">
              {singlePlayerStats.name}
            </p>
            <p
              className={cx("text-9xl text-white my-4", {
                "text-red-500": singlePlayerStats.score < 0,
              })}
            >
              {formatScore(singlePlayerStats.score)}
            </p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Scoreboard;
