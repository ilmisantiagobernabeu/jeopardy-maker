import { useGlobalState } from "./GlobalStateProvider";
import { useEffect, useState } from "react";
import cx from "classnames";

export const Debug = () => {
  const { gameState } = useGlobalState();
  const localDebugKeys = localStorage.getItem("bz-debugKeys")
    ? JSON.parse(localStorage.getItem("bz-debugKeys") as string)
    : [];
  const initialKeys = Object.keys(gameState || {});
  const [keys, setKeys] = useState<string[]>(localDebugKeys || initialKeys);

  // useEffect(() => {
  //   const newKeys = Object.keys(gameState || {});
  //   setKeys(newKeys);
  // }, [gameState]);

  useEffect(() => {
    localStorage.setItem("bz-debugKeys", JSON.stringify(keys));
  }, [keys.length]);

  if (!gameState) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2 text-white items-center">
        {initialKeys
          .sort((a, b) => (a > b ? 1 : -1))
          .map((key) => (
            <button
              key={key}
              className={cx("text-white px-2 py-1", {
                "bg-[#707079]": !keys.includes(key),
                "bg-[#060ce9]": keys.includes(key),
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
        <button
          className="ml-2"
          onClick={() => {
            setKeys(Object.keys(gameState || {}));
          }}
        >
          Select all
        </button>
        <button
          onClick={() => {
            setKeys([]);
          }}
        >
          Select none
        </button>
      </div>
      <pre className="text-white">
        {JSON.stringify(
          Object.fromEntries(
            Object.entries(gameState)
              .sort((a, b) => (a > b ? 1 : -1))
              .filter(([key]) => keys.includes(key))
          ),
          null,
          2
        )}
      </pre>
    </>
  );
};
