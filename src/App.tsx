import { useState } from "react";
import cx from "classnames";
import GameCard from "./GameCard";
import "./App.scss";
import Scoreboard from "./Scoreboard";
import PlayerJoin from "./PlayerJoin";
import { useLocation } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";

type Section = {
  category: string;
  clues: string[];
};

function App() {
  const [round, setRound] = useState(1);

  const { search } = useLocation();

  const searchParams = new URLSearchParams(search);

  const { gameState } = useGlobalState();

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

      <button>+ (Add new Player)</button>
    </>
  );
}

export default App;
