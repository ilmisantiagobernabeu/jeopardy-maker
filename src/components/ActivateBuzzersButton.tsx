import { useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { useGameSettings } from "./GameSettingsProvider";

type ActivateBuzzersButtonProps = {
  onClick: () => void;
  isAudioClue: boolean;
  isImageClue: boolean;
  audioSeconds: number;
  imageSeconds: number;
};

export const ActivateBuzzersButton = ({
  onClick,
  isAudioClue,
  isImageClue,
  audioSeconds,
  imageSeconds,
}: ActivateBuzzersButtonProps) => {
  const { settingsState } = useGameSettings();
  useEffect(() => {
    const handleSpacebar = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        onClick();
      }
    };
    window.addEventListener("keydown", handleSpacebar);

    return () => {
      window.removeEventListener("keydown", handleSpacebar);
    };
  }, []);

  if (
    (isImageClue && settingsState.imageClueDelay === 0) ||
    (isAudioClue && settingsState.audioClueDelay === 0)
  ) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="text-green-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
    >
      <span className="flex gap-4 w-full items-center">
        {isAudioClue || isImageClue ? (
          <>
            <span className="whitespace-nowrap">Activating Buzzers...</span>
            <CircularProgressbar
              className="w-10 h-10"
              value={
                (isAudioClue
                  ? audioSeconds / (settingsState.audioClueDelay || 1)
                  : imageSeconds / (settingsState.imageClueDelay || 1)) * 100
              }
              strokeWidth={50}
              styles={{
                path: {
                  stroke: "#dedede",
                  fill: "#dedede",
                  strokeLinecap: "butt",
                },
                trail: {
                  stroke: "#ff0000",
                  strokeLinecap: "butt",
                },
              }}
            />
          </>
        ) : (
          <p className="flex flex-col">
            <span className="whitespace-nowrap leading-none">
              Activate Buzzers
            </span>
            <span className="text-lg leading-none">(Spacebar)</span>
          </p>
        )}
      </span>
    </button>
  );
};
