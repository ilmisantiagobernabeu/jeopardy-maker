import cx from "classnames";
import "../App.scss";
import { useGlobalState } from "../GlobalStateProvider";
import GameCardStatic from "../GameCardStatic";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SingleGame } from "../../../stateTypes";
import { HamburgerMenu } from "../HamburgerMenu";
import { useGetUpdatedGameState } from "../../hooks/useGetUpdatedGameState";
import { Edit } from "lucide-react";
import { useCreateNewBoard } from "../../api/useCreateNewBoard";
import { useGetUserBoards } from "../../api/useGetUserBoards";
import { getInitialGameState } from "./utilities";
import { EditTitle } from "./EditTitle";

type StateType = {
  data: SingleGame;
};

function CreateGame({ isPreview = false }: { isPreview?: boolean }) {
  const createNewBoard = useCreateNewBoard();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const round = Number(queryParams.get("round") || 1);
  const gameName = queryParams.get("name") || "";

  const { session } = useGlobalState();

  const { data: userBoards } = useGetUserBoards(session?.user.id || "");

  const state = location.state as StateType;
  const data = state?.data;

  const [gameState, setGameState] = useState<SingleGame>(
    data || getInitialGameState(gameName)
  );
  const [isEditGameName, setIsEditGameName] = useState(false);
  const [gameTitle, setGameTitle] = useState(gameState.name);

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

    const existingGame = Object.values(userBoards || {})?.find(
      (game) => game.name === gameName
    );

    if (existingGame) {
      setGameState(existingGame);
    }
  }, [userBoards, location]);

  useEffect(() => {
    if (!data) {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("name", gameState.name);

      navigate(`${location.pathname}?${queryParams.toString()}`);
    }
  }, [data, gameState.name]);

  const handleEdit = () => {
    setIsEditGameName(false);

    if (
      gameTitle.trim().length === 0 ||
      gameTitle.trim() === gameState.name.trim()
    ) {
      setGameTitle(gameState.name);
      return;
    }

    setGameState((prevGameState) => {
      const newGameState = structuredClone(prevGameState);
      newGameState.name = gameTitle;

      return newGameState;
    });

    createNewBoard.mutate({
      previousGameName: gameState.name,
      game: { ...gameState, name: gameTitle },
      userId: localStorage.getItem("bz-userId") || "",
      clueType: undefined,
    });
  };

  const path = isPreview ? "/preview" : "/create";

  return (
    <>
      <HamburgerMenu isVisible />
      <div className="Game">
        <div className="text-white text-center flex flex-col justify-center items-center bg-[#060ce9] py-4 px-4 gap-2">
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
                onBlur={handleEdit}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    handleEdit();
                  }
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
                {!isPreview && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditGameName(true);
                      }}
                    >
                      <Edit width={20} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex gap-4">
            <p>
              <Link
                to={`${path}?name=${gameState.name}&round=1`}
                className={cx("btn-sm", {
                  "secondary-btn": round !== 1,
                  "primary-btn": round === 1,
                })}
                style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
              >
                Round 1
              </Link>
            </p>
            <p>
              <Link
                to={`${path}?name=${gameState.name}&round=2`}
                className={cx("btn-sm", {
                  "secondary-btn": round !== 2,
                  "primary-btn": round === 2,
                })}
                style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
              >
                Round 2
              </Link>
            </p>
          </div>
        </div>
        <div className="Game-grid">
          {catTitles?.map((title, catIndex) => (
            <EditTitle
              key={title + catIndex}
              title={title}
              catIndex={catIndex}
              setGameState={setGameState}
              round={round}
              isPreview={isPreview}
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
                isPreview={isPreview}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default CreateGame;
