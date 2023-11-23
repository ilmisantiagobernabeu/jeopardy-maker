import { useEffect, useRef, useState } from "react";
import GameCard from "./GameCard";
import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import { Link, useLocation, useParams } from "react-router-dom";
import { HamburgerMenu } from "./HamburgerMenu";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";
import { Clue, ClueType } from "../../stateTypes";

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
  const { roomId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const game = queryParams.get("game") || "";
  const round = Number(queryParams.get("round")) || 1;
  const { gameState, socket } = useGlobalState();
  const [roundOver, setRoundOver] = useState(false);
  const [pointerOver, setPointerOver] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useGetUpdatedGameState();

  useEffect(() => {
    const resourceClues = gameState?.gameBoard
      .flatMap((round) => round.clues)
      .filter((clue) => [ClueType.AUDIO, ClueType.IMAGE].includes(clue.type));

    if (resourceClues) {
      preloadResources(resourceClues);
    }
  }, [gameState?.gameBoard]);

  useEffect(() => {
    if (
      roomId &&
      localStorage.getItem("dt-gameName") &&
      game === localStorage.getItem("dt-gameName")
    ) {
      socket?.emit(
        "Host loads the game board for the first time",
        game,
        roomId || ""
      );
    } else if (roomId && localStorage.getItem("dt-gameName") && socket) {
      localStorage.setItem("dt-gameName", game);
      socket?.emit(
        "Host changes the game",
        game,
        gameState?.players,
        roomId || "",
        localStorage.getItem("bz-userId") || ""
      );
    }
  }, [socket, location, game, roomId]);

  useEffect(() => {
    if (roomId) {
      socket?.emit("Host navigates to another round", round, roomId || "");
    }
  }, [round, socket, roomId]);

  const catTitles = gameState?.gameBoard.map((d) => d.category);

  const clues = gameState?.gameBoard
    .map((obj) => obj.clues)
    .reduce((newArr, _, index, ogArr) => {
      for (const cat in gameState?.gameBoard) {
        if (ogArr[cat][index]) {
          newArr.push(ogArr[cat][index]);
        }
      }

      return newArr;
    }, []);

  const isEveryCluePlayed = clues?.every(
    (clue) => clue?.alreadyPlayed || !clue.text || !clue.answer
  );

  const numOfRounds = gameState?.games[game].rounds.length || 0;

  useEffect(() => {
    let timeout = 0;
    if (isEveryCluePlayed) {
      timeout = window.setTimeout(() => {
        setRoundOver(true);
      }, 3000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [round, isEveryCluePlayed]);

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
        {roundOver && isEveryCluePlayed && round === numOfRounds ? (
          <div className="h-screen flex justify-center items-center">
            <Link
              className="text-white h-full w-full flex justify-center items-center text-9xl bg-[#060ce9]"
              to={`/scoreboard/${roomId}`}
              onClick={() => {
                setRoundOver(false);
              }}
            >
              Game Over
            </Link>
          </div>
        ) : roundOver ? (
          <div className="h-screen flex justify-center items-center">
            <Link
              className="text-white h-full w-full flex justify-center items-center text-9xl bg-[#060ce9]"
              to={`/board/${roomId}?game=${game}&round=${round + 1}`}
              onClick={() => {
                setRoundOver(false);
              }}
            >
              Double Jeopardy Round Next
            </Link>
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
                  key={round + index}
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
