import { useEffect, useRef, useState } from "react";
import GameCard from "./GameCard";
import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import { Link, useLocation } from "react-router-dom";
import { HamburgerMenu } from "./HamburgerMenu";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";
import { Clue, ClueType } from "../../stateTypes";
import { useGetGameBoard } from "../api/useGetGameBoard";
import { Loader } from "lucide-react";
import { useGetUserBoards } from "../api/useGetUserBoards";

function preloadResources(clues: Clue[]): void {
  clues.forEach((clue) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = `https://buzzinga.s3.us-east-2.amazonaws.com/${clue.text}`;
    link.as = clue.type.toLowerCase();

    document.head.appendChild(link);
  });
}

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const gameQueryParam = queryParams.get("game") || "";
  const round = Number(queryParams.get("round")) || 1;
  const { gameState, socket, roundOver, setRoundOver, session } =
    useGlobalState();
  const [pointerOver, setPointerOver] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const { data: userBoards } = useGetUserBoards(
    localStorage.getItem("bz-roomId") || "",
    session?.user.id || ""
  );

  useGetUpdatedGameState();

  const { data: gameBoardData, isLoading } = useGetGameBoard(
    localStorage.getItem("bz-roomId") || "",
    gameQueryParam,
    !!localStorage.getItem("bz-roomId") &&
      !!localStorage.getItem("dt-gameName") &&
      gameQueryParam === localStorage.getItem("dt-gameName")
  );

  useEffect(() => {
    const resourceClues = gameState?.game.rounds[gameState.round - 1]
      .flatMap((round) => round.clues)
      .filter((clue) => [ClueType.AUDIO, ClueType.IMAGE].includes(clue.type));

    if (resourceClues) {
      preloadResources(resourceClues);
    }
  }, [gameState?.game, gameState?.round]);

  useEffect(() => {
    if (localStorage.getItem("bz-roomId")) {
      socket?.emit(
        "Host navigates to another round",
        round,
        localStorage.getItem("bz-roomId") || ""
      );
    }
  }, [round, socket]);

  const catTitles = gameState?.game.rounds[gameState.round - 1].map(
    (d) => d.category
  );

  const clues = gameState?.game.rounds[gameState.round - 1]
    .map((obj) => obj.clues)
    .reduce((newArr, _, index, ogArr) => {
      for (const cat in gameState?.game.rounds[gameState.round - 1]) {
        if (ogArr[cat][index]) {
          newArr.push(ogArr[cat][index]);
        }
      }

      return newArr;
    }, []);

  const isEveryCluePlayed = clues?.every(
    (clue) => clue?.alreadyPlayed || !clue.text || !clue.answer
  );

  const isEveryCluePlayedInAllRounds = gameState?.games[
    gameQueryParam
  ]?.rounds.every((round) =>
    round.every((column) =>
      column.clues.every((clue) => clue.alreadyPlayed || !clue.answer)
    )
  );

  useEffect(() => {
    let timeout = 0;
    if (isEveryCluePlayed || isEveryCluePlayedInAllRounds) {
      timeout = window.setTimeout(() => {
        setRoundOver(true);
      }, 3000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [round, isEveryCluePlayed, isEveryCluePlayedInAllRounds]);

  const numOfRounds = gameState?.games[gameQueryParam]?.rounds.length || 0;

  if (isLoading) {
    return (
      <div className="Game">
        <div className="h-screen flex justify-center items-center text-white max-w-5xl mx-auto">
          <div className="w-full flex gap-2 justify-center">
            <Loader className="animate-spin" />
            <p className="font-semibold">Loading board...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!numOfRounds) {
    return (
      <div className="Game">
        <div className="h-screen flex justify-center items-center text-white max-w-5xl mx-auto">
          <div className="flex flex-col justify-center items-center gap-4 ">
            <p>This game is not available.</p>
            <Link to="/" className="primary-btn">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="Game">
        <HamburgerMenu
          isVisible={pointerOver}
          onPointerOver={() => {
            setPointerOver(true);
            if (timeout.current) {
              clearTimeout(timeout.current);
            }
          }}
        />
        {roundOver && isEveryCluePlayedInAllRounds ? (
          <div className="h-screen flex flex-col gap-8 justify-center items-center bg-[#060ce9]">
            <div className="flex flex-col gap-4 justify-center items-center max-w-sm">
              <h2 className="font-bold text-5xl leading-none text-center normal-case mb-2 text-white">
                Game over
              </h2>
              <Link
                className="primary-btn w-auto"
                to={`/scoreboard`}
                onClick={() => {
                  setRoundOver(false);
                }}
              >
                Show final scores
              </Link>
            </div>
          </div>
        ) : roundOver ? (
          <div className="h-screen flex flex-col gap-8 justify-center items-center bg-[#060ce9]">
            <div className="flex flex-col gap-4 justify-center items-center max-w-xxl">
              <h2 className="font-bold text-5xl leading-none text-center normal-case mb-2 text-white">
                Double Jeopardy Round Next
              </h2>
              <Link
                className="primary-btn w-auto flex-none"
                to={`/board?game=${gameQueryParam}&round=${round + 1}`}
                onClick={() => {
                  setRoundOver(false);
                }}
              >
                Continue
              </Link>
            </div>
          </div>
        ) : (
          <div className="Game-grid">
            {catTitles?.map((title, index) => (
              <div
                className="Game-category"
                key={title}
                onPointerOver={() => {
                  if (index < 2) {
                    setPointerOver(true);
                    if (timeout.current) {
                      clearTimeout(timeout.current);
                    }
                  }
                }}
                onPointerLeave={() => {
                  if (index < 2) {
                    timeout.current = setTimeout(() => {
                      setPointerOver(false);
                    }, 3000);
                  }
                }}
              >
                {title}
              </div>
            ))}
            {clues?.map((clue, index) => {
              return (
                <GameCard
                  key={round + index + clue.text + clue.answer}
                  clue={clue}
                  index={index}
                  round={round}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
