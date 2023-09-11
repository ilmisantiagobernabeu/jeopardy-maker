import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import GameCardStatic from "./GameCardStatic";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Game } from "../stateTypes";
import EditIcon from "./icons/EditIcon";
import { useCreateGameMutation } from "./api/createGame";

const getInitialGameState = (gameName: string) => ({
  name: gameName,
  rounds: [
    [
      {
        category: "Category A",
        clues: [
          {
            text: "A - Clue 1",
            answer: "Answer 1",
          },
          {
            text: "A - Clue 2",
            answer: "Answer 2",
          },
          {
            text: "A - Clue 3",
            answer: "Answer 3",
          },
          {
            text: "A - Clue 4",
            answer: "Answer 3",
          },
          {
            text: "A - Clue 5",
            answer: "Answer 4",
          },
          {
            text: "A - Clue 6",
            answer: "Answer 5",
          },
        ],
      },
      {
        category: "Category B",
        clues: [
          {
            text: "B - Clue 1",
            answer: "Answer 1",
          },
          {
            text: "B - Clue 2",
            answer: "Answer 2",
          },
          {
            text: "B - Clue 3",
            answer: "Answer 3",
          },
          {
            text: "B - Clue 4",
            answer: "Answer 3",
          },
          {
            text: "B - Clue 5",
            answer: "Answer 4",
          },
          {
            text: "B - Clue 6",
            answer: "Answer 5",
          },
        ],
      },
      {
        category: "Category C",
        clues: [
          {
            text: "C - Clue 1",
            answer: "Answer 1",
          },
          {
            text: "C - Clue 2",
            answer: "Answer 2",
          },
          {
            text: "C - Clue 3",
            answer: "Answer 3",
          },
          {
            text: "C - Clue 4",
            answer: "Answer 3",
          },
          {
            text: "C - Clue 5",
            answer: "Answer 4",
          },
          {
            text: "C - Clue 6",
            answer: "Answer 5",
          },
        ],
      },
      {
        category: "Category D",
        clues: [
          {
            text: "D - Clue 1",
            answer: "Answer 1",
          },
          {
            text: "D - Clue 2",
            answer: "Answer 2",
          },
          {
            text: "D - Clue 3",
            answer: "Answer 3",
          },
          {
            text: "D - Clue 4",
            answer: "Answer 3",
          },
          {
            text: "D - Clue 5",
            answer: "Answer 4",
          },
          {
            text: "D - Clue 6",
            answer: "Answer 5",
          },
        ],
      },
      {
        category: "Category E",
        clues: [
          {
            text: "E - Clue 1",
            answer: "Answer 1",
          },
          {
            text: "E - Clue 2",
            answer: "Answer 2",
          },
          {
            text: "E - Clue 3",
            answer: "Answer 3",
          },
          {
            text: "E - Clue 4",
            answer: "Answer 3",
          },
          {
            text: "E - Clue 5",
            answer: "Answer 4",
          },
          {
            text: "E - Clue 6",
            answer: "Answer 5",
          },
        ],
      },
      {
        category: "Category F",
        clues: [
          {
            text: "F - Clue 1",
            answer: "Answer 1",
          },
          {
            text: "F - Clue 2",
            answer: "Answer 2",
          },
          {
            text: "F - Clue 3",
            answer: "Answer 3",
          },
          {
            text: "F - Clue 4",
            answer: "Answer 3",
          },
          {
            text: "F - Clue 5",
            answer: "Answer 4",
          },
          {
            text: "F - Clue 6",
            answer: "Answer 5",
          },
        ],
      },
    ],
  ],
});

function CreateGame() {
  const createGame = useCreateGameMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const round = Number(queryParams.get("round") || 1);
  const gameName = queryParams.get("name") || "";

  const { gameState: globalGameState } = useGlobalState();

  const [gameState, setGameState] = useState(getInitialGameState(gameName));
  const [isEditGameName, setIsEditGameName] = useState(false);

  const catTitles = gameState.rounds[round - 1]?.map((round) => round.category);

  const clues = gameState.rounds[round - 1]
    ?.map((round) => round.clues)
    .reduce((newArr, _, index, ogArr) => {
      for (const cat in gameState?.rounds[round - 1]) {
        if (ogArr[cat][index]) {
          newArr.push(ogArr[cat][index]);
        }
      }

      return newArr;
    }, []);

  // check name query param
  // if that already exists as a game name in global state
  // load up that info in local gameState
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const gameName = queryParams.get("name");

    const existingGame = Object.values(globalGameState?.games || {})?.find(
      (game) => game.name === gameName
    );

    if (existingGame) {
      setGameState(existingGame);
    }
  }, [globalGameState, location]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("name", gameState.name);

    navigate(`${location.pathname}?${queryParams.toString()}`);
  }, [gameState.name]);

  return (
    <>
      <div className="Game">
        <div className="text-white text-center flex flex-col justify-center items-center bg-[#060ce9] p-4 gap-4">
          <div className="flex gap-2">
            {isEditGameName ? (
              <input
                type="text"
                className="font-bold text-4xl font-korinna uppercase text-gold text-center bg-transparent"
                style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
                value={gameState.name}
                autoFocus
                onChange={(e) => {
                  setGameState((prevGameState) => ({
                    ...prevGameState,
                    name: e.target.value.replace(" ", "-"),
                  }));
                }}
                onBlur={() => {
                  setIsEditGameName(false);
                }}
              />
            ) : (
              <>
                <h2
                  className="font-bold text-4xl font-korinna uppercase text-gold text-center"
                  style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
                >
                  {gameState.name.replaceAll("-", " ")}
                </h2>
                <button
                  onClick={() => {
                    setIsEditGameName(true);
                  }}
                >
                  <EditIcon width={20} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-4">
            <p>
              <Link
                to="/create?round=1"
                className="block border rounded-md py-1 px-2"
              >
                Round 1
              </Link>
            </p>
            <p>
              <Link
                to="/create?round=2"
                className="block border rounded-md py-1 px-2"
              >
                Round 2
              </Link>
            </p>
            <button
              className="primary-btn"
              onClick={() => {
                createGame.mutate(gameState, {
                  onSuccess() {
                    console.log("Created new game file succesfully!");
                  },
                  onError(err) {
                    console.log(
                      "Failed to create new game file succesfully!",
                      err
                    );
                  },
                });
              }}
            >
              Save Game
            </button>
          </div>
        </div>
        <div className="Game-grid">
          {catTitles?.map((title, catIndex) => (
            <EditTitle
              title={title}
              catIndex={catIndex}
              setGameState={setGameState}
              round={round}
            />
          ))}
          {clues?.map((clue, index) => {
            return (
              <GameCardStatic
                key={clue.text}
                clue={clue}
                index={index}
                round={round}
                setGameState={setGameState}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

type EditTitleProps = {
  title: string;
  setGameState: React.Dispatch<React.SetStateAction<Game>>;
  round: number;
  catIndex: number;
};

const EditTitle = ({
  title,
  setGameState,
  round,
  catIndex,
}: EditTitleProps) => {
  const [newTitle, setNewTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  return (
    <div className="Game-category" key={title}>
      {isEditing ? (
        <textarea
          key={title}
          value={newTitle}
          className="bg-transparent text-center uppercase text-5xl w-full"
          onChange={(e) => {
            setIsEditing(true);
            setNewTitle(e.target.value);
          }}
          onBlur={() => {
            setIsEditing(false);
            setGameState((prevGameState) => {
              const newGameState = structuredClone(prevGameState);
              newGameState.rounds[round - 1][catIndex].category = newTitle;
              return newGameState;
            });
          }}
          autoFocus
        />
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
          }}
          className="uppercase"
        >
          {newTitle}
        </button>
      )}
    </div>
  );
};

export default CreateGame;
