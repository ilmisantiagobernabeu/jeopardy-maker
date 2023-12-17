import { useEffect, useLayoutEffect, useRef, useState } from "react";
import cx from "classnames";
import { useGlobalState } from "./GlobalStateProvider";
import NobodyKnowsButton from "./NobodyKnowsButton";
import useCountDown from "react-better-countdown-hook";
import rightAnswerSound from "../sounds/rightanswer.mp3";
import wrongAnswerSound from "../sounds/wronganswer.mp3";
import dailyDoubleSound from "../sounds/dailydouble.mp3";
import hahaSound from "../sounds/haha.mp3";
import Answer from "./Answer";
import "react-circular-progressbar/dist/styles.css";
import { Clue, ClueType } from "../../stateTypes";
import { ActivateBuzzersButton } from "./ActivateBuzzersButton";
import { useGameSettings } from "./GameSettingsProvider";
import { Image, Music } from "lucide-react";

type Props = {
  clue: Clue;
  index: number;
  round: number;
};

const GameCard = ({ clue, index, round }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
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
  const [showAnswer, setShowAnswer] = useState(false);
  const [dailyDoubleAmount, setDailyDoubleAmount] = useState(0);
  const [showDailyDoubleScreen, setShowDailyDoubleScreen] = useState(false);

  const clueIndex = Math.floor(index / 6);

  const { settingsState } = useGameSettings();

  const [{ seconds }, { start, reset }] = useCountDown({
    // Start time in milliseconds
    startTimeMilliseconds: settingsState.countdownTimeToAnswer * 1000,
    // Decrement to update the timer with
    interval: 1000,
    // Callback triggered when the timer reaches 0
    onCountDownEnd: () => {
      // this will run for every game card instance
      // so we only want to mark incorrect for the currently flipped one
      if (isFlipped && !clue.alreadyPlayed) {
        handleIncorrect();
      }
    },
  });

  const [{ seconds: audioSeconds }, { start: audioStart, reset: audioReset }] =
    useCountDown({
      // Start time in milliseconds
      startTimeMilliseconds: settingsState.audioClueDelay * 1000 || 1,
      // Decrement to update the timer with
      interval: 100,
      // Callback triggered when the timer reaches 0
      onCountDownEnd: () => {
        // this will run for every game card instance
        // so we only want to mark incorrect for the currently flipped one
        if (isFlipped && !clue.alreadyPlayed) {
          handleBuzzerToggle();
          audioReset();
        }
      },
    });

  const [{ seconds: imageSeconds }, { start: imageStart, reset: imageReset }] =
    useCountDown({
      // Start time in milliseconds
      startTimeMilliseconds: settingsState.imageClueDelay * 1000 || 1,
      // Decrement to update the timer with
      interval: 100,
      // Callback triggered when the timer reaches 0
      onCountDownEnd: () => {
        // this will run for every game card instance
        // so we only want to mark incorrect for the currently flipped one
        if (isFlipped && !clue.alreadyPlayed) {
          handleBuzzerToggle();
          imageReset();
        }
      },
    });

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

    if (isFlipped && clue?.isDailyDouble) {
      setShowDailyDoubleScreen(true);
      const audio = new Audio(dailyDoubleSound);
      audio.play();
      socket?.emit(
        "Team selects a daily double clue",
        localStorage.getItem("bz-roomId") || ""
      );
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
        imageReset();
        audioReset();
        socket?.emit(
          "Host deselects a clue",
          localStorage.getItem("bz-roomId") || ""
        );
      }
    };

    window.addEventListener("keyup", handleEscape);

    return () => {
      window.removeEventListener("keyup", handleEscape);
    };
  });

  const value = Math.max(1, Math.ceil((index + 1) / 6)) * 100 * (round * 2);

  const { socket, gameState } = useGlobalState() || {};

  const buzzedInUserExists = Boolean(
    gameState?.activePlayer || gameState?.dailyDoubleAmount
  );

  useEffect(() => {
    // if buzzed in user exists
    if (buzzedInUserExists) {
      start();
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
      reset();
    }
  }, [gameState]);

  const isAudioClue = clue.type === ClueType.AUDIO;

  const isImageClue = clue.type === ClueType.IMAGE;

  const handleIncorrect = () => {
    const audio = new Audio(wrongAnswerSound);
    audio.play();
    socket?.emit("A player answers the clue", {
      value: gameState?.dailyDoubleAmount
        ? gameState.dailyDoubleAmount * -1
        : value * -1,
      arrayIndex: index % 6,
      clueText: clue.text,
      roomId: localStorage.getItem("bz-roomId") || "",
    });

    // Only show answer if this is the last incorrect guess
    const numOfPlayers =
      Object.values(gameState?.players || {}).filter((x) => x.name).length || 0;
    if (gameState?.incorrectGuesses.length === numOfPlayers - 1) {
      setShowAnswer(true);
    }
  };

  const handleCorrect = () => {
    // 2. close the clue everywhere
    setResetStyles(undefined);
    setStyles(undefined);
    setIsFlipped(false);

    socket?.emit("A player answers the clue", {
      value: gameState?.dailyDoubleAmount || value,
      arrayIndex: index % 6,
      clueText: clue.text,
      roomId: localStorage.getItem("bz-roomId") || "",
    });

    const audio = new Audio(rightAnswerSound);
    audio.play();
    setShowAnswer(true);
  };

  const handleBuzzerToggle = () => {
    socket?.emit(
      "Host activates the buzzers",
      localStorage.getItem("bz-roomId") || ""
    );
  };

  const handleNobodyKnows = () => {
    const audio = new Audio(hahaSound);
    audio.play();
    socket?.emit(
      "No player knows the answer",
      {
        clueIndex,
        arrayIndex: index % 6,
      },
      localStorage.getItem("bz-roomId") || ""
    );
    setShowAnswer(true);
  };

  if (clue?.alreadyPlayed || !clue.text || !clue.answer) {
    return (
      <>
        <div
          className={cx("GameCard", {
            "is-flipped": isFlipped,
          })}
        >
          <div className="bg-black absolute inset-0" />
        </div>
        {showAnswer && <Answer setShowAnswer={setShowAnswer} />}
      </>
    );
  }

  const handleClick = () => {
    // disallow clicks after it's already been flipped
    if (isFlipped) {
      return;
    }

    setIsFlipped(true);

    socket?.emit(
      "Host selects a clue",
      clue,
      localStorage.getItem("bz-roomId") || ""
    );

    if (isAudioClue) {
      // let audioRef render first
      setTimeout(() => {
        audioRef.current?.play();
      });
      audioStart();
    } else if (isImageClue) {
      console.log("image started!!!");
      imageStart();
    }
  };

  const handleRangeChange = (e: any) => {
    setDailyDoubleAmount(Number(e.target.value));
  };

  const handleSetWager = () => {
    // seend daily double amount ot server
    socket?.emit(
      "A player sets daily double wager",
      {
        dailyDoubleAmount,
        arrayIndex: index % 6,
        clueText: clue.text,
      },
      localStorage.getItem("bz-roomId") || ""
    );
    // socket?.emit("Host activates the buzzers");

    setShowDailyDoubleScreen(false);
    setDailyDoubleAmount(0);
  };

  const buzzedInPlayer =
    gameState?.players[
      gameState?.activePlayer || gameState.lastActivePlayer || ""
    ]?.name;

  const showActivateBuzzersButton = Boolean(
    !gameState?.isBuzzerActive &&
      !gameState?.activePlayer &&
      !showDailyDoubleScreen &&
      !Boolean(gameState?.dailyDoubleAmount)
  );

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
          {clue.type === ClueType.IMAGE && (
            <span
              title="Daily Double"
              className="absolute bottom-0 right-0 w-9 h-9 text-lg [text-shadow:none] flex items-center m-2 text-white opacity-80"
            >
              <Image />
            </span>
          )}
          {clue.type === ClueType.AUDIO && (
            <span
              title="Daily Double"
              className="absolute bottom-0 right-0 w-9 h-9 text-lg [text-shadow:none] flex items-center m-2 text-white opacity-80"
            >
              <Music />
            </span>
          )}
        </div>
        {isFlipped && (
          <>
            <div
              className="ClueModal flex-col"
              style={{ ...styles, ...resetStyles }}
            >
              {showDailyDoubleScreen && clue.isDailyDouble && (
                <div className="absolute top-0 w-full h-full flex flex-col justify-center items-center z-20 bg-[#060ce9]">
                  It's a daily double!
                  <label htmlFor="wager">
                    How much would you like to wager?
                  </label>
                  <input
                    id="wager"
                    type="range"
                    step="200"
                    min="200"
                    onChange={handleRangeChange}
                    value={dailyDoubleAmount}
                    max={Math.max(
                      gameState?.players[gameState?.lastActivePlayer || ""]
                        ?.score || 0,
                      1000
                    )}
                  />
                  <p>${dailyDoubleAmount}</p>
                  <button onClick={handleSetWager}>Set Wager</button>
                </div>
              )}
              <p className="ClueModal-text">
                {isAudioClue ? (
                  <audio ref={audioRef} controls className="max-w-full">
                    <source
                      src={`https://buzzinga.s3.us-east-2.amazonaws.com/${clue.text}`}
                      type="audio/mpeg"
                    />
                  </audio>
                ) : isImageClue ? (
                  <div
                    className="flex justify-center items-center w-[50vw] h-[50vh]"
                    style={{
                      transform: `scale(${scale?.x / (scale?.x * scale?.x)}, ${
                        scale?.y / (scale?.y * scale?.y)
                      })`,
                    }}
                  >
                    <img
                      src={`https://buzzinga.s3.us-east-2.amazonaws.com/${clue.text}`}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <>{clue.text}</>
                )}
              </p>
            </div>
          </>
        )}
      </button>
      {isFlipped && (
        <div className="fixed z-10 bottom-0 left-0 right-0 flex justify-center align-center p-5 gap-x-8">
          {buzzedInUserExists && (
            <>
              {seconds > 0 && (
                <div
                  className={cx(
                    "fixed top-0 right-0 w-full h-24 bg-red-500 text-white",
                    { "animate-pulse": seconds <= 10 }
                  )}
                  style={{
                    width: `${
                      (seconds / settingsState.countdownTimeToAnswer) * 100
                    }%`,
                  }}
                ></div>
              )}
              <p className="fixed top-4 w-full text-center text-6xl text-white">
                Buzzed In:{" "}
                <span className="text-green-500">{buzzedInPlayer}</span>
              </p>
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
            </>
          )}
          {gameState?.isBuzzerActive && (
            <NobodyKnowsButton onClick={handleNobodyKnows} />
          )}
          {showActivateBuzzersButton && (
            <ActivateBuzzersButton
              audioSeconds={audioSeconds}
              imageSeconds={imageSeconds}
              isAudioClue={isAudioClue}
              isImageClue={isImageClue}
              onClick={handleBuzzerToggle}
            />
          )}
        </div>
      )}
      {showAnswer && <Answer setShowAnswer={setShowAnswer} />}
    </>
  );
};

export default GameCard;
