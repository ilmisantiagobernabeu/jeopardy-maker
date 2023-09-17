import { useEffect, useRef, useState } from "react";
import GameCard from "./GameCard";
import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import { Link, useLocation } from "react-router-dom";
import { HamburgerMenu } from "./HamburgerMenu";

function App({ round }: { round: number }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const game = queryParams.get("game") || "";
  const { gameState, socket } = useGlobalState();
  const [roundOver, setRoundOver] = useState(false);
  const [pointerOver, setPointerOver] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      localStorage.getItem("dt-gameName") &&
      game === localStorage.getItem("dt-gameName")
    ) {
      socket?.emit("Host loads the game board for the first time", game);
    } else if (localStorage.getItem("dt-gameName") && socket) {
      localStorage.setItem("dt-gameName", game);
      socket?.emit("Host changes the game", game);
    }
  }, [socket, location, game]);

  useEffect(() => {
    socket?.emit("Host navigates to another round", round);
  }, [round, socket]);

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

  const isEveryCluePlayed = clues?.every((clue) => clue?.alreadyPlayed);

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
  }, [isEveryCluePlayed]);

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
        {roundOver ? (
          <div className="h-screen flex justify-center items-center h-full">
            <Link
              className="text-white h-full w-full flex justify-center items-center text-9xl bg-[#060ce9]"
              to={`/board${round + 1}`}
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
                  key={clue.text + index.toString()}
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
