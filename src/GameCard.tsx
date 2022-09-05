import { useEffect, useLayoutEffect, useRef, useState } from "react";
import cx from "classnames";
import { useLocation } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";
import NobodyKnowsButton from "./NobodyKnowsButton";
import rightAnswerSound from "./rightanswer.mp3";
import wrongAnswerSound from "./wronganswer.mp3";
import hahaSound from "./haha.mp3";

type Clue = {
  text: string;
  answer: string;
  alreadyPlayed?: boolean;
};
type Props = {
  clue: Clue;
  index: number;
  round: number;
};

const GameCard = ({ clue, index, round }: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [styles, setStyles] = useState<Record<string, any> | undefined>(
    undefined
  );
  const [resetStyles, setResetStyles] = useState<
    Record<string, any> | undefined
  >(undefined);
  const [scale, setScale] = useState<Record<string, any> | undefined>(
    undefined
  );

  const { search } = useLocation();

  const searchParams = new URLSearchParams(search);

  useLayoutEffect(() => {
    if (isFlipped && buttonRef.current) {
      const { left, top, width, height } =
        buttonRef.current.getBoundingClientRect();

      setScale({
        x: window.innerWidth / width,
        y: window.innerHeight / height,
      });

      let styles = {
        width,
        height,
        inset: 0,
        transform: `translate(${left}px, ${top}px)`,
      };
      setStyles(styles);
    } else {
      setStyles(undefined);
    }
  }, [isFlipped]);

  useEffect(() => {
    if (styles && scale) {
      setResetStyles({
        transition: "transform 1s",
        transform: `translate(0, 0) scale(${scale.x}, ${scale.y})`,
      });
    }
  }, [scale, styles]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResetStyles(undefined);
        setStyles(undefined);
        setIsFlipped(false);
      }
    };

    window.addEventListener("keyup", handleEscape);

    return () => {
      window.removeEventListener("keyup", handleEscape);
    };
  });

  const value = Math.max(1, Math.ceil((index + 1) / 6)) * 100 * (round * 2);

  const { socket, gameState } = useGlobalState() || {};

  const handleCorrect = () => {
    // 2. close the clue everywhere
    setResetStyles(undefined);
    setStyles(undefined);
    setIsFlipped(false);

    socket?.emit("A player answers the clue", {
      value,
      arrayIndex: index % 6,
      clueText: clue.text,
    });

    const audio = new Audio(rightAnswerSound);
    audio.play();
  };

  const handleIncorrect = () => {
    const audio = new Audio(wrongAnswerSound);
    audio.play();
    socket?.emit("A player answers the clue", {
      value: value * -1,
      arrayIndex: index % 6,
      clueText: clue.text,
    });
  };

  const handleBuzzerToggle = () => {
    socket?.emit("Host activates the buzzers");
  };

  const handleNobodyKnows = () => {
    const audio = new Audio(hahaSound);
    audio.play();
    socket?.emit("No player knows the answer", {
      clueText: clue.text,
      arrayIndex: index % 6,
    });
  };

  if (clue?.alreadyPlayed) {
    return (
      <div
        className={cx("GameCard", {
          "is-flipped": isFlipped,
        })}
      >
        <div className="bg-black absolute inset-0" />
      </div>
    );
  }

  const handleClick = () => {
    setIsFlipped(true);
    socket?.emit("Host selects a clue", clue);
  };

  return (
    <>
      <button
        className={cx("GameCard", {
          "is-flipped": isFlipped,
        })}
        onClick={handleClick}
        ref={buttonRef}
      >
        <div className="GameCard-front">
          <span className="GameCard-dollarSign">$</span>
          {value}
        </div>
        {isFlipped && (
          <div
            className="ClueModal flex-col"
            style={{ ...styles, ...resetStyles }}
          >
            <p className="ClueModal-text">{clue.text}</p>
          </div>
        )}
      </button>
      {isFlipped && (
        <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center align-center p-5 gap-x-8">
          {gameState?.players[gameState?.activePlayer]?.name && (
            <p className="fixed top-4 w-full text-center text-6xl text-white">
              Buzzed In:{" "}
              <span className="text-green-500">
                Team {gameState?.players[gameState?.activePlayer]?.name}
              </span>
            </p>
          )}
          {gameState?.activePlayer && (
            <>
              <button
                onClick={handleCorrect}
                className="text-green-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
              >
                Correct!
              </button>
              <button
                onClick={handleIncorrect}
                className="text-red-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
              >
                Incorrect!
              </button>
            </>
          )}
          {gameState?.isBuzzerActive && (
            <NobodyKnowsButton onClick={handleNobodyKnows} />
          )}
          {Boolean(!gameState?.isBuzzerActive && !gameState?.activePlayer) && (
            <button
              onClick={handleBuzzerToggle}
              className="text-green-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
            >
              Activate Buzzers
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default GameCard;
