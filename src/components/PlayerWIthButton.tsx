import { useState } from "react";
import { PlayerObject } from "../../stateTypes";
import DeleteIcon from "../icons/DeleteIcon";
import { useGlobalState } from "./GlobalStateProvider";
import { KeysDisplay } from "./KeysDisplay";

type PlayerWithButtonProps = {
  player: PlayerObject;
};

export const PlayerWithButton = ({ player }: PlayerWithButtonProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [localPlayerName, setLocalPlayerName] = useState(player.name);
  const { socket } = useGlobalState() || {};

  const handleEdit = () => {
    setIsEditMode(false);
    if (
      localPlayerName.trim().length === 0 ||
      localPlayerName.trim() === player.name.trim()
    ) {
      return;
    }

    socket?.emit(
      "Edit player name",
      localStorage.getItem("bz-roomId") || "",
      player.socketId,
      localPlayerName.trim()
    );
  };

  return (
    <tr
      key={player.name?.toString()}
      className="even:bg-gray-900 even:!bg-opacity-30 "
    >
      <td>
        {isEditMode ? (
          <input
            type="text"
            className="w-60 font-bold text-4xl font-korinna uppercase text-gold bg-transparent"
            style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
            value={localPlayerName}
            autoFocus
            onChange={(e) => {
              setLocalPlayerName(e.target.value.trim());
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleEdit();
              }
            }}
            onBlur={handleEdit}
          />
        ) : (
          <button
            className="appearance-none font-bold text-4xl font-korinna uppercase text-gold bg-transparent"
            style={{ textShadow: "rgb(0, 0, 0) 0.08em 0.08em" }}
            onClick={() => {
              setIsEditMode(true);
            }}
          >
            {localPlayerName}
          </button>
        )}
      </td>
      <td>
        <KeysDisplay keys={player?.keys} />
      </td>
      <td>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              socket?.emit(
                "Delete the player",
                localStorage.getItem("bz-roomId") || "",
                player.socketId
              );
            }}
          >
            <DeleteIcon width={20} />
          </button>
        </div>
      </td>
    </tr>
  );
};
