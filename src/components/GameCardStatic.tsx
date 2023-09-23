import { useEffect, useState } from "react";
import cx from "classnames";
import CloseIcon from "../icons/CloseIcon";
import { SingleGame } from "../../stateTypes";

type Clue = {
  text: string;
  answer: string;
  isDailyDouble?: boolean;
  alreadyPlayed?: boolean;
};
type Props = {
  clue: Clue;
  index: number;
  round: number;
  setGameState: React.Dispatch<React.SetStateAction<SingleGame>>;
};

const GameCardStatic = ({ clue, index, round, setGameState }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFlipped(false);
      }
    };

    window.addEventListener("keyup", handleEscape);

    return () => {
      window.removeEventListener("keyup", handleEscape);
    };
  }, []);

  const value = Math.max(1, Math.ceil((index + 1) / 6)) * 100 * (round * 2);

  const handleClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  return (
    <>
      <button
        className={cx("GameCard", {
          "is-flipped ": isFlipped,
        })}
        onClick={handleClick}
      >
        <div className="GameCard-front">
          <span className="GameCard-dollarSign">$</span>
          {value}
        </div>
        {isFlipped && (
          <>
            <EditModal
              setIsFlipped={setIsFlipped}
              clue={clue}
              setGameState={setGameState}
              index={index}
              round={round}
            />
          </>
        )}
      </button>
    </>
  );
};

type EditModalProps = {
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  clue: Clue;
  setGameState: React.Dispatch<React.SetStateAction<SingleGame>>;
  index: number;
  round: number;
};

const EditModal = ({
  setIsFlipped,
  clue,
  setGameState,
  index,
  round,
}: EditModalProps) => {
  const [isDailyDouble, setIsDailyDouble] = useState(
    clue.isDailyDouble || false
  );
  const [answer, setAnswer] = useState(clue.answer);
  const [clueText, setClueText] = useState(clue.text);

  const catIndex = index % 6;
  const clueIndex = Math.floor(index / 6);

  const noChanges =
    clue.text === clueText &&
    clue.answer === answer &&
    !!clue.isDailyDouble === isDailyDouble;

  return (
    <div className="ClueModal w-full h-full left-0 right-0 text-3xl">
      <button
        type="button"
        className={cx(
          "fixed font-bold top-0 left-0 p-8 leading-none appearance-none"
        )}
        onClick={() => {
          setIsFlipped(false);
        }}
      >
        <CloseIcon width={20} className="" />
      </button>
      <div className="w-full max-w-3xl flex justify-center items-center flex-col gap-4">
        <div className="grid grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-1">
            <label htmlFor={`clue-${clue.text}`}>Clue</label>
            <textarea
              id={`clue-${clue.text}`}
              className="p-3   text-center border-white border rounded-sm flex-grow text-base text-black"
              value={clueText}
              onChange={(e) => {
                setClueText(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`clue-${clue.answer}`}>Answer</label>
            <textarea
              id={`clue-${clue.answer}`}
              className="p-3   text-center border-white border rounded-sm flex-grow text-base text-black"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="flex gap-1">
          <label htmlFor={`clue-${clue.isDailyDouble}`}>Is Daily Double</label>
          <input
            id={`clue-${clue.isDailyDouble}`}
            type="checkbox"
            className="ClueModal-text bg-transparent text-center border-white border rounded-sm"
            checked={isDailyDouble}
            onChange={(e) => {
              setIsDailyDouble(e.target.checked);
            }}
          />
        </div>
        <button
          className="primary-btn !text-3xl mt-4 !w-36"
          onClick={() => {
            setGameState((prevGameState) => {
              const newGameState = structuredClone(prevGameState);
              newGameState.rounds[round - 1][catIndex].clues[clueIndex].text =
                clueText;
              newGameState.rounds[round - 1][catIndex].clues[clueIndex].answer =
                answer;
              newGameState.rounds[round - 1][catIndex].clues[
                clueIndex
              ].isDailyDouble = isDailyDouble;
              return newGameState;
            });
          }}
          disabled={noChanges}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default GameCardStatic;
