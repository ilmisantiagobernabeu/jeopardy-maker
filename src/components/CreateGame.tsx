import "./App.scss";
import { useGlobalState } from "./GlobalStateProvider";
import GameCardStatic from "./GameCardStatic";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ClueType, SingleGame } from "../../stateTypes";
import EditIcon from "../icons/EditIcon";
import { HamburgerMenu } from "./HamburgerMenu";
import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";

const getInitialGameState = (gameName: string) => ({
  name: gameName,
  userId: "",
  isPublic: false,
  rounds: [
    [
      {
        category: "Category A",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category B",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category C",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category D",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category E",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category F",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
    ],
    [
      {
        category: "Category A",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category B",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category C",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category D",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category E",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
      {
        category: "Category F",
        clues: [
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
          {
            text: "",
            answer: "",
            type: ClueType.TEXT,
          },
        ],
      },
    ],
  ],
});

function CreateGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const round = Number(queryParams.get("round") || 1);
  const gameName = queryParams.get("name") || "";

  const { socket, gameState: globalGameState, session } = useGlobalState();

  const [gameState, setGameState] = useState<SingleGame>(
    getInitialGameState(gameName)
  );
  const [isEditGameName, setIsEditGameName] = useState(false);
  const [gameTitle, setGameTitle] = useState(gameState.name);

  useGetUpdatedGameState();

  const catTitles = gameState.rounds?.[round - 1]?.map(
    (round) => round.category
  );

  const clues = gameState.rounds?.[round - 1]
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
      <HamburgerMenu />
      <div className="Game">
        <div className="text-white text-center flex flex-col justify-center items-center bg-[#060ce9] p-4 gap-4">
          <div className="flex gap-2">
            {isEditGameName ? (
              <input
                type="text"
                className="font-bold text-4xl font-korinna uppercase text-gold text-center bg-transparent"
                style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
                value={gameTitle}
                autoFocus
                onChange={(e) => {
                  setGameTitle(e.target.value.replace(" ", "-"));
                }}
                onBlur={() => {
                  setIsEditGameName(false);

                  if (gameTitle.trim().length === 0) {
                    setGameTitle(gameState.name);
                    return;
                  }

                  setGameState((prevGameState) => {
                    const newGameState = structuredClone(prevGameState);
                    newGameState.name = gameTitle;

                    socket?.emit(
                      "create a new game",
                      gameState.name,
                      newGameState,
                      globalGameState?.guid || "",
                      localStorage.getItem("bz-userId") || ""
                    );

                    return newGameState;
                  });
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
                to={`/create?name=${gameState.name}&round=1`}
                className="block border rounded-md py-1 px-2"
              >
                Round 1
              </Link>
            </p>
            <p>
              <Link
                to={`/create?name=${gameState.name}&round=2`}
                className="block border rounded-md py-1 px-2"
              >
                Round 2
              </Link>
            </p>
          </div>
        </div>
        <div className="Game-grid">
          {catTitles?.map((title, catIndex) => (
            <EditTitle
              key={title}
              title={title}
              catIndex={catIndex}
              setGameState={setGameState}
              round={round}
            />
          ))}
          {clues?.map((clue, index) => {
            return (
              <GameCardStatic
                key={round + index}
                clue={clue}
                index={index}
                round={round}
                setGameState={setGameState}
                localGameState={gameState}
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
  setGameState: React.Dispatch<React.SetStateAction<SingleGame>>;
  round: number;
  catIndex: number;
};

const EditTitle = ({
  title,
  setGameState,
  round,
  catIndex,
}: EditTitleProps) => {
  const { gameState, socket } = useGlobalState();
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

            if (newTitle.trim().length === 0) {
              setNewTitle(title);
              return;
            }

            setGameState((prevGameState) => {
              const newGameState = structuredClone(prevGameState);
              newGameState.rounds[round - 1][catIndex].category = newTitle;

              socket?.emit(
                "create a new game",
                newGameState.name,
                newGameState,
                gameState?.guid || "",
                localStorage.getItem("bz-userId") || ""
              );

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
