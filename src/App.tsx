import { useState } from "react";
import "./App.scss";

type Section = {
  category: string;
  clues: string[];
};

const data = [
  {
    category: "History",
    clues: [
      "First one in first section",
      "Second one in first section",
      "Hello",
      "Testing a much longer answer than the others",
      "Second to last one",
    ],
  },
  {
    category: "Geography",
    clues: [
      "First one in second section",
      "Second one in second section",
      "Hello",
      "Testing a much longer answer than the others",
      "Second to last one",
    ],
  },
  {
    category: "Science",
    clues: [
      "First one in third section",
      "He plays in the sand",
      "Hello",
      "Testing a much longer answer than the others",
      "Second to last one",
    ],
  },
  {
    category: "Astronomy",
    clues: [
      "First one",
      "He plays in the sand",
      "Hello",
      "Testing a much longer answer than the others",
      "Second to last one",
    ],
  },
  {
    category: "Celebrities",
    clues: [
      "First one",
      "He plays in the sand",
      "Hello",
      "Testing a much longer answer than the others",
      "Second to last one",
    ],
  },
  {
    category: "1999",
    clues: [
      "First one",
      "He plays in the sand",
      "Hello",
      "Testing a much longer answer than the others",
      "Second to last one",
    ],
  },
];

const catTitles = data.map((d) => d.category);

const clues = data
  .map((obj) => obj.clues)
  .reduce((newArr: string[], clues, index, ogArr) => {
    for (const clueNum in clues) {
      newArr.push(ogArr[clueNum][index]);
    }

    return newArr;
  }, []);

// loop through each array

console.log("wtfwtfwtfwtfwtf", clues);

function App() {
  const [round, setRound] = useState(1);

  return (
    <div className="Game">
      <div className="Game-grid">
        {catTitles.map((title) => (
          <div>{title}</div>
        ))}
        {clues.map((a, i) => {
          return (
            <button className="GameCard">
              <div className="GameCard-front">
                {Math.max(1, Math.ceil((i + 1) / 6)) * 100 * (round * 2)}
              </div>
              <div className="GameCard-back">{a}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
