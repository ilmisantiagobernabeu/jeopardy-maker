import { useState } from "react";
import cx from "classnames";
import GameCard from "./GameCard";
import "./App.scss";
import { data } from "./data";

type Section = {
  category: string;
  clues: string[];
};

const catTitles = data.map((d) => d.category);

const clues = data
  .map((obj) => obj.clues)
  .reduce((newArr, _, index, ogArr) => {
    for (const cat in data) {
      if (ogArr[cat][index]) {
        newArr.push(ogArr[cat][index]);
      }
    }

    return newArr;
  }, []);

function App() {
  const [round, setRound] = useState(1);

  return (
    <div className="Game">
      <div className="Game-grid">
        {catTitles.map((title) => (
          <div className="Game-category">{title}</div>
        ))}
        {clues.map((clue, index) => {
          return <GameCard clue={clue} index={index} round={round} />;
        })}
      </div>
    </div>
  );
}

export default App;
