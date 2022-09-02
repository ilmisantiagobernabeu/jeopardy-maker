import { useEffect, useLayoutEffect, useRef, useState } from "react";
import cx from "classnames";
import { useLocation } from "react-router-dom";
import { useGlobalState } from "./GlobalStateProvider";

type Clue = {
  text: string;
  answer: string;
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

      const scaleX = window.innerWidth / width;
      const scaleY = window.innerHeight / height;

      setScale({
        x: window.innerWidth / width,
        y: window.innerHeight / height,
      });

      let styles = {
        width,
        height,
        inset: 0,
        // transition: "transform 3s",
        transform: `translate(${left}px, ${top}px)`, // scale(${scaleX}, ${scaleY})
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

  const isHost = searchParams.get("isHost") === "true";

  const { setPlayers } = useGlobalState() || {};

  const handleCorrect = () => {
    setPlayers?.((players: any) => ({
      ...players,
      "Team 1": 400,
    }));
  };

  return (
    <>
      <button
        className={cx("GameCard", {
          "is-flipped": isFlipped,
        })}
        onClick={() => setIsFlipped(true)}
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
            {isHost && (
              <div className="font-normal text-green-700">{clue.answer}</div>
            )}
          </div>
        )}
      </button>
      {isFlipped && isHost && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center align-center p-5 gap-x-8">
          <button
            className="text-green-600 text-6xl bg-white hover:bg-black p-4 rounded-md"
            onClick={handleCorrect}
          >
            Correct!
          </button>
          <button className="text-red-600 text-6xl bg-white hover:bg-black p-4 rounded-md">
            Incorrect!
          </button>
        </div>
      )}
    </>
  );
};

export default GameCard;
