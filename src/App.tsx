import { useEffect, useState } from "react";
import GameCard from "./GameCard";
import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import { Link, useNavigate } from "react-router-dom";

function App({ round }: { round: number }) {
  const { gameState, socket } = useGlobalState();
  const [roundOver, setRoundOver] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    socket?.emit("Host navigates to another round", round);
  }, [round, socket]);

  const catTitles = gameState?.gameBoard.map((d) => d.category);

  const clues = gameState?.gameBoard
    .map((obj) => obj.clues)
    .reduce((newArr, _, index, ogArr) => {
      for (const cat in gameState?.gameBoard) {
        if (ogArr[cat][index]) {
          newArr.push(ogArr[cat][index]);
        }
      }

      return newArr;
    }, []);

  const isEveryCluePlayed = clues?.every((clue) => clue?.alreadyPlayed);

  useEffect(() => {
    let timeout = 0;
    if (isEveryCluePlayed) {
      timeout = window.setTimeout(() => {
        setRoundOver(true);
      }, 3000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isEveryCluePlayed]);

  return (
    <>
      <div className="Game">
        {roundOver ? (
          <div className="h-screen flex justify-center items-center h-full">
            <Link
              className="text-white h-full w-full flex justify-center items-center text-9xl bg-[#060ce9]"
              to={`/game${round + 1}`}
            >
              Double Jeopardy Round Next
            </Link>
          </div>
        ) : (
          <div className="Game-grid">
            {catTitles?.map((title) => (
              <div className="Game-category" key={title}>
                {title}
              </div>
            ))}
            {clues?.map((clue, index) => {
              return (
                <GameCard
                  key={clue.text + index.toString()}
                  clue={clue}
                  index={index}
                  round={round}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
