import { useEffect, useState } from "react";
import cx from "classnames";
import CloseIcon from "../icons/CloseIcon";
import { Clue, ClueType, SingleGame } from "../../stateTypes";
import { useGlobalState } from "./GlobalStateProvider";
import axios from "axios";

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
        <div
          className={cx("GameCard-front", {
            "opacity-50": !clue.text || !clue.answer,
          })}
        >
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
  const { socket } = useGlobalState();
  const [isDailyDouble, setIsDailyDouble] = useState(
    clue.isDailyDouble || false
  );
  const [answer, setAnswer] = useState(clue.answer);
  const [clueText, setClueText] = useState(clue.text);
  const [clueType, setClueType] = useState<ClueType>(clue.type);
  const [imageFile, setImageFile] = useState<any>(null);
  const [audioFile, setAudioFile] = useState<any>(null);
  const [imageName, setImageName] = useState(
    clue.type === ClueType.IMAGE ? clue.text : null
  );
  const [audioName, setAudioName] = useState(
    clue.type === ClueType.AUDIO ? clue.text : null
  );
  const [answerType, setAnswerType] = useState<ClueType>(ClueType.TEXT);

  const catIndex = index % 6;
  const clueIndex = Math.floor(index / 6);

  const noChanges =
    clue.text === clueText &&
    clue.answer === answer &&
    !!clue.isDailyDouble === isDailyDouble;

  const handleClueSubmitImage = async (event: any) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", imageFile);

    const { data: imageName } = await axios.post("/api/uploadImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setImageName(imageName);
    setClueText(imageName);
  };

  const handleClueSubmitAudio = async (event: any) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("mp3", audioFile);

    const { data: imageName } = await axios.post("/api/uploadAudio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setAudioName(imageName);
    setClueText(imageName);
  };

  return (
    <div className="ClueModal w-full h-full left-0 right-0 text-3xl">
      <div className="w-full max-w-3xl flex justify-center items-center flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <label htmlFor={`clue-${clue.text}`}>Clue</label>
              <ul className="flex gap-2 list-none lowercase font-korinna text-xs">
                <li>
                  <button
                    onClick={() => {
                      setClueType(ClueType.TEXT);
                    }}
                    className={cx("p-1", {
                      border: clueType === ClueType.TEXT,
                    })}
                  >
                    Text
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setClueType(ClueType.IMAGE);
                    }}
                    className={cx("p-1", {
                      border: clueType === ClueType.IMAGE,
                    })}
                  >
                    Image
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setClueType(ClueType.AUDIO);
                    }}
                    className={cx("p-1", {
                      border: clueType === ClueType.AUDIO,
                    })}
                  >
                    Audio
                  </button>
                </li>
              </ul>
            </div>
            {clueType === ClueType.TEXT ? (
              <textarea
                id={`clue-${clue.text}`}
                className="p-3   text-center border-white border rounded-sm flex-grow text-base text-black"
                value={clueText}
                onChange={(e) => {
                  setClueText(e.target.value);
                }}
              />
            ) : clueType === ClueType.IMAGE ? (
              <>
                {imageName && (
                  <img
                    src={`https://buzzinga.s3.us-east-2.amazonaws.com/${imageName}`}
                    alt=""
                    className="max-w-[50px] max-h-[50px] object-contain"
                  />
                )}
                <form onSubmit={handleClueSubmitImage}>
                  <input
                    onChange={(e) => setImageFile(e?.target?.files?.[0])}
                    type="file"
                    accept="image/*"
                  />
                  <button type="submit">Upload</button>
                </form>
              </>
            ) : clueType === ClueType.AUDIO ? (
              <>
                {audioName && (
                  <audio controls className="max-w-full">
                    <source
                      src={`https://buzzinga.s3.us-east-2.amazonaws.com/${audioName}`}
                      type="audio/mpeg"
                    />
                  </audio>
                )}
                <form onSubmit={handleClueSubmitAudio}>
                  <input
                    onChange={(e) => {
                      console.log("wtfwtf", e.target.files?.[0]);
                      setAudioFile(e?.target?.files?.[0]);
                    }}
                    type="file"
                    accept=".mp3"
                  />
                  <button type="submit">Upload</button>
                </form>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <label htmlFor={`clue-${clue.answer}`}>Answer</label>
              {/* <ul className="flex gap-2 list-none lowercase font-korinna text-xs">
                <li>
                  <button
                    onClick={() => {
                      setAnswerType(ClueType.TEXT);
                    }}
                  >
                    Text
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setAnswerType(ClueType.IMAGE);
                    }}
                  >
                    Image
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setAnswerType(ClueType.AUDIO);
                    }}
                  >
                    Audio
                  </button>
                </li>
              </ul> */}
            </div>
            {answerType === ClueType.TEXT ? (
              <textarea
                id={`clue-${clue.answer}`}
                className="p-3   text-center border-white border rounded-sm flex-grow text-base text-black"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                }}
              />
            ) : answerType === ClueType.IMAGE ? (
              <textarea
                id={`clue-${clue.answer}`}
                className="p-3   text-center border-white border rounded-sm flex-grow text-base text-black"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                }}
              />
            ) : null}
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
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className={cx("secondary-btn !text-3xl mt-4 !w-auto")}
            onClick={() => {
              setIsFlipped(false);
            }}
          >
            <span className="flex gap-2">
              <CloseIcon width={16} /> Close
            </span>
          </button>
          <button
            className="primary-btn !text-3xl mt-4 !w-36"
            onClick={() => {
              setGameState((prevGameState) => {
                const newGameState = structuredClone(prevGameState);
                newGameState.rounds[round - 1][catIndex].clues[clueIndex].type =
                  clueType;
                newGameState.rounds[round - 1][catIndex].clues[clueIndex].text =
                  clueText;
                newGameState.rounds[round - 1][catIndex].clues[
                  clueIndex
                ].answer = answer;
                newGameState.rounds[round - 1][catIndex].clues[
                  clueIndex
                ].isDailyDouble = isDailyDouble;
                newGameState.rounds[round - 1][catIndex].clues[
                  clueIndex
                ].alreadyPlayed = false;

                socket?.emit("create a new game", newGameState);

                return newGameState;
              });
            }}
            disabled={noChanges}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCardStatic;
