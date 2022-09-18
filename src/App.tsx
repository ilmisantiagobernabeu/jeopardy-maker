import { useEffect } from "react";
import GameCard from "./GameCard";
import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import { useNavigate } from "react-router-dom";

function App({ round }: { round: number }) {
  const { gameState, socket } = useGlobalState();

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

  useEffect(() => {
    const isEveryCluePlayed = clues?.every((clue) => clue?.alreadyPlayed);

    if (isEveryCluePlayed) {
      // navigate(`/game${round + 1}`);
    }
  }, [round, clues]);

  return (
    <>
      <div className="Game">
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
      </div>
    </>
  );
}

export default App;
