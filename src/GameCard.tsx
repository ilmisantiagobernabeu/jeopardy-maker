import { useEffect, useLayoutEffect, useRef, useState } from "react"
import cx from "classnames"
import { useLocation } from "react-router-dom"
import { useGlobalState } from "./GlobalStateProvider"
import NobodyKnowsButton from "./NobodyKnowsButton"
import rightAnswerSound from "./rightanswer.mp3"
import wrongAnswerSound from "./wronganswer.mp3"
import dailyDoubleSound from "./dailydouble.mp3"
import hahaSound from "./haha.mp3"
import Answer from "./Answer"

import Sound1 from "./01_hot_in_here.mp3"
import Sound2 from "./02_all_my_life.mp3"
import Sound3 from "./03_all_star.mp3"
import Sound4 from "./04_britney.mp3"
import Sound5 from "./05_nirvana.mp3"

import Sound6 from "./07_californiacation.mp3"
import Sound7 from "./08_whitney.mp3"
import Sound8 from "./06_mumford.mp3"
import Sound9 from "./09_taylor.mp3"
import Sound10 from "./10_mgmt.mp3"

type Clue = {
  text: string
  answer: string
  isDailyDouble?: boolean
  alreadyPlayed?: boolean
}
type Props = {
  clue: Clue
  index: number
  round: number
}

const soundMap: { [key: string]: string } = {
  "01_hot_in_here.mp3": Sound1,
  "02_all_my_life.mp3": Sound2,
  "03_all_star.mp3": Sound3,
  "04_britney.mp3": Sound4,
  "05_nirvana.mp3": Sound5,
  "06_mumford.mp3": Sound6,
  "07_californiacation.mp3": Sound7,
  "08_whitney.mp3": Sound8,
  "09_taylor.mp3": Sound9,
  "10_mgmt.mp3": Sound10,
}

const GameCard = ({ clue, index, round }: Props) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [styles, setStyles] = useState<Record<string, any> | undefined>(
    undefined
  )
  const [resetStyles, setResetStyles] = useState<
    Record<string, any> | undefined
  >(undefined)
  const [scale, setScale] = useState<Record<string, any> | undefined>(undefined)
  const [showAnswer, setShowAnswer] = useState(false)
  const [dailyDoubleAmount, setDailyDoubleAmount] = useState(0)
  const [showDailyDoubleScreen, setShowDailyDoubleScreen] = useState(false)

  // const { search } = useLocation();

  // const searchParams = new URLSearchParams(search);

  useLayoutEffect(() => {
    if (isFlipped && buttonRef.current) {
      const { left, top, width, height } =
        buttonRef.current.getBoundingClientRect()

      setScale({
        x: window.innerWidth / width,
        y: window.innerHeight / height,
      })

      let styles = {
        width,
        height,
        inset: 0,
        transform: `translate(${left}px, ${top}px)`,
      }
      setStyles(styles)
    } else {
      setStyles(undefined)
    }

    if (isFlipped && clue?.isDailyDouble) {
      setShowDailyDoubleScreen(true)
      const audio = new Audio(dailyDoubleSound)
      audio.play()
    }
  }, [isFlipped])

  useEffect(() => {
    if (styles && scale) {
      setResetStyles({
        transition: "transform 1s",
        transform: `translate(0, 0) scale(${scale.x}, ${scale.y})`,
      })
    }
  }, [scale, styles])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setResetStyles(undefined)
        setStyles(undefined)
        setIsFlipped(false)
      }
    }

    window.addEventListener("keyup", handleEscape)

    return () => {
      window.removeEventListener("keyup", handleEscape)
    }
  })

  const value = Math.max(1, Math.ceil((index + 1) / 6)) * 100 * (round * 2)

  const { socket, gameState } = useGlobalState() || {}

  const handleCorrect = () => {
    // 2. close the clue everywhere
    setResetStyles(undefined)
    setStyles(undefined)
    setIsFlipped(false)

    socket?.emit("A player answers the clue", {
      value: gameState?.dailyDoubleAmount || value,
      arrayIndex: index % 6,
      clueText: clue.text,
    })

    const audio = new Audio(rightAnswerSound)
    audio.play()
    setShowAnswer(true)
  }

  const handleIncorrect = () => {
    const audio = new Audio(wrongAnswerSound)
    audio.play()
    console.log(
      "wtf bruh",
      gameState?.dailyDoubleAmount
        ? gameState.dailyDoubleAmount * -1
        : value * -1
    )
    socket?.emit("A player answers the clue", {
      value: gameState?.dailyDoubleAmount
        ? gameState.dailyDoubleAmount * -1
        : value * -1,
      arrayIndex: index % 6,
      clueText: clue.text,
    })

    // Only show answer if this is the last incorrect guess
    const numOfPlayers =
      Object.values(gameState?.players || {}).filter((x) => x.name).length || 0
    if (gameState?.incorrectGuesses.length === numOfPlayers - 1) {
      setShowAnswer(true)
    }
  }

  const handleBuzzerToggle = () => {
    socket?.emit("Host activates the buzzers")
  }

  const handleNobodyKnows = () => {
    const audio = new Audio(hahaSound)
    audio.play()
    socket?.emit("No player knows the answer", {
      clueText: clue.text,
      arrayIndex: index % 6,
    })
    setShowAnswer(true)
  }

  if (clue?.alreadyPlayed) {
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
    )
  }

  const handleClick = () => {
    setIsFlipped(true)
    socket?.emit("Host selects a clue", clue)
  }

  const handleRangeChange = (e: any) => {
    setDailyDoubleAmount(Number(e.target.value))
  }

  const handleSetWager = () => {
    // seend daily double amount ot server
    socket?.emit("A player sets daily double wager", {
      dailyDoubleAmount,
      arrayIndex: index % 6,
      clueText: clue.text,
    })
    // socket?.emit("Host activates the buzzers");

    setShowDailyDoubleScreen(false)
    setDailyDoubleAmount(0)
  }

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
          <>
            <div
              className="ClueModal flex-col"
              style={{ ...styles, ...resetStyles }}
            >
              {showDailyDoubleScreen && clue.isDailyDouble && (
                <div className="absolute top-0 w-full h-full flex flex-col justify-center items-center z-20 bg-[#060ce9]">
                  It's a daily double bitches
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
                      gameState?.players[gameState?.lastActivePlayer]?.score ||
                        0,
                      1000
                    )}
                  />
                  <p>${dailyDoubleAmount}</p>
                  <button onClick={handleSetWager}>Set Wager</button>
                </div>
              )}
              <p className="ClueModal-text">
                {clue.text.endsWith("mp3") ? (
                  <audio controls>
                    <source src={soundMap[clue.text]} type="audio/mpeg" />
                  </audio>
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
          {gameState?.players[gameState?.activePlayer]?.name && (
            <p className="fixed top-4 w-full text-center text-6xl text-white">
              Buzzed In:{" "}
              <span className="text-green-500">
                Team {gameState?.players[gameState?.activePlayer]?.name}
              </span>
            </p>
          )}
          {Boolean(gameState?.activePlayer || gameState?.dailyDoubleAmount) && (
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
          {Boolean(
            !gameState?.isBuzzerActive &&
              !gameState?.activePlayer &&
              !showDailyDoubleScreen &&
              !Boolean(gameState?.dailyDoubleAmount)
          ) && (
            <button
              onClick={handleBuzzerToggle}
              className="text-green-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
            >
              Activate Buzzers
            </button>
          )}
        </div>
      )}
      {showAnswer && <Answer setShowAnswer={setShowAnswer} />}
    </>
  )
}

export default GameCard
