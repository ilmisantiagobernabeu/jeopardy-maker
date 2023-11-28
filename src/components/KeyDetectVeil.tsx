import React from "react";
import { useEffect, useState } from "react";
import CloseIcon from "../icons/CloseIcon";
import { PlayerObject } from "../../stateTypes";
import { KeysDisplay } from "./KeysDisplay";

function areArraysEqual(arr1: string[], arr2: string[]): boolean {
  // Check if arrays have the same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Sort both arrays
  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  // Compare the sorted arrays element by element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  // If all elements are equal, the arrays are equal
  return true;
}

type KeyDetectVeilProps = {
  setKeys: React.Dispatch<React.SetStateAction<string[]>>;
  onRequestClose: () => void;
  players: PlayerObject[];
};

export const KeyDetectVeil = ({
  setKeys,
  onRequestClose,
  players,
}: KeyDetectVeilProps) => {
  const [localKeys, setLocalKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDetect = (e: KeyboardEvent) => {
      if (!localKeys.includes(e.key)) {
        setLocalKeys((prevKeys) => [...prevKeys, e.key]);
      }
    };

    window.addEventListener("keydown", handleKeyDetect);

    return () => {
      window.removeEventListener("keydown", handleKeyDetect);
    };
  }, [localKeys]);

  const sameKeyBindingsExists = players.some(
    (player) => player?.keys?.length && areArraysEqual(player.keys, localKeys)
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-90 flex flex-col justify-center items-center z-50">
      <button onClick={onRequestClose} className="absolute top-0 left-0 p-8">
        <CloseIcon width={16} />
      </button>
      <div className="flex flex-col gap-8 max-w-lg">
        <h2 className="text-3xl">Detecting Keys...</h2>
        <div className="flex gap-2 justify-center items-center">
          <KeysDisplay keys={localKeys} />
        </div>
        {sameKeyBindingsExists && (
          <p className="text-color-error rounded-sm px-2 py-13 bg-red-500">
            Same key bindings already exist for another button.
          </p>
        )}
        <div className="flex gap-4">
          <button
            className="secondary-btn"
            disabled={localKeys.length === 0}
            onClick={() => {
              setLocalKeys([]);
            }}
          >
            Reset
          </button>
          <button
            className="primary-btn"
            onClick={() => {
              setKeys(localKeys);
              onRequestClose();
            }}
            disabled={sameKeyBindingsExists}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
