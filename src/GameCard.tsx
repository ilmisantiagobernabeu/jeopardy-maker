import { useEffect, useLayoutEffect, useRef, useState } from "react";
import cx from "classnames";

type Props = {
  clue: string;
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

  return (
    <button
      className={cx("GameCard", {
        "is-flipped": isFlipped,
      })}
      onClick={() => setIsFlipped(true)}
      ref={buttonRef}
    >
      <div className="GameCard-front">
        <span className="GameCard-dollarSign">$</span>
        {Math.max(1, Math.ceil((index + 1) / 6)) * 100 * (round * 2)}
      </div>
      {isFlipped && (
        <div className="ClueModal" style={{ ...styles, ...resetStyles }}>
          {clue}
        </div>
      )}
    </button>
  );
};

export default GameCard;
