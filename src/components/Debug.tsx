import { useGlobalState } from "./GlobalStateProvider";
import { useState } from "react";
import cx from "classnames";

export const Debug = () => {
  const { gameState } = useGlobalState();
  const initialKeys = Object.keys(gameState || {});
  const [keys, setKeys] = useState<string[]>(initialKeys);

  if (!gameState) {
    return null;
  }

  const { games, gameBoard, ...rest } = gameState || {};

  return (
    <>
      <div className="flex gap-2">
        {initialKeys.map((key) => (
          <button
            className={cx("text-white px-2 py-1 bg-[#060ce9]", {
              "bg-red-400": !keys.includes(key),
            })}
            onClick={() => {
              if (keys?.includes(key)) {
                setKeys((prevKeys) =>
                  prevKeys.filter((prevKey) => prevKey !== key)
                );
              } else {
                setKeys((prevKeys) => [...prevKeys, key]);
              }
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <pre className="text-white">
        {JSON.stringify(
          Object.fromEntries(
            Object.entries(gameState).filter(([key]) => keys.includes(key))
          ),
          null,
          2
        )}
      </pre>
    </>
  );
};
