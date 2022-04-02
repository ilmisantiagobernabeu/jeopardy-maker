import { useState } from "react";
import cx from "classnames";
import GameCard from "./GameCard";
import "./App.scss";

type Section = {
  category: string;
  clues: string[];
};

const data = [
  {
    category: "History",
    clues: ["History 1", "History 2", "History 3", "History 4", "History 5"],
  },
  {
    category: "Geography",
    clues: [
      "Geography 1",
      "Geography 2",
      "Geography 3",
      "Geography 4",
      "Geography 5",
    ],
  },
  {
    category: "Science",
    clues: ["Science 1", "Science 2", "Science 3", "Science 4", "Science 5"],
  },
  {
    category: "Astronomy",
    clues: [
      "Astronomy 1",
      "Astronomy 2",
      "Astronomy 3",
      "Astronomy 4",
      "Astronomy 5",
    ],
  },
  {
    category: "Celebrities",
    clues: [
      "Celebrities 1",
      "Celebrities 2",
      "Celebrities 3",
      "Celebrities 4",
      "Celebrities 5",
    ],
  },
  {
    category: "Dennett-ology",
    clues: [
      "This 10-letter word is a friend of Guy Dennett. Used to describe something in a very positive manner.",
      "1999 2",
      "1999 3",
      "1999 4",
      "1999 5",
    ],
  },
];

const catTitles = data.map((d) => d.category);

const clues = data
  .map((obj) => obj.clues)
  .reduce((newArr: string[], _, index, ogArr) => {
    for (const cat in data) {
      if (ogArr[cat][index]) {
        newArr.push(ogArr[cat][index]);
      }
    }

    return newArr;
  }, []);

// loop through each array

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
