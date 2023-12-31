import { useEffect, useState } from "react";
import { SingleGame } from "../../../stateTypes";
import { useCreateNewBoard } from "../../api/useCreateNewBoard";

type EditTitleProps = {
  title: string;
  setGameState: React.Dispatch<React.SetStateAction<SingleGame>>;
  round: number;
  catIndex: number;
  isPreview: boolean;
};

export const EditTitle = ({
  title,
  setGameState,
  round,
  catIndex,
  isPreview,
}: EditTitleProps) => {
  const createNewBoard = useCreateNewBoard();
  const [newTitle, setNewTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  const handleEdit = () => {
    setIsEditing(false);

    if (newTitle.trim().length === 0 || newTitle.trim() === title.trim()) {
      setNewTitle(title);
      return;
    }

    setGameState((prevGameState) => {
      const newGameState = structuredClone(prevGameState);
      newGameState.rounds[round - 1][catIndex].category = newTitle;

      createNewBoard.mutate({
        previousGameName: newGameState.name,
        game: newGameState,
        userId: localStorage.getItem("bz-userId") || "",
        clueType: undefined,
      });

      return newGameState;
    });
  };

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
          onBlur={handleEdit}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleEdit();
            }
          }}
          autoFocus
        />
      ) : (
        <button
          onClick={() => {
            if (isPreview) {
              return false;
            }
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
