import { useEffect } from "react";
import { CircularProgressbar } from "react-circular-progressbar";

type ActivateBuzzersButtonProps = {
  onClick: () => void;
  isAudioClue: boolean;
  imageSeconds: number;
};

export const ActivateBuzzersButton = ({
  onClick,
  isAudioClue,
  imageSeconds,
}: ActivateBuzzersButtonProps) => {
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

  return (
    <button
      onClick={onClick}
      className="text-green-600 disabled:opacity-30 text-6xl bg-white hover:bg-black p-4 rounded-md"
    >
      <span className="flex gap-4 w-full items-center">
        {isAudioClue ? (
          <>
            <span className="whitespace-nowrap">Activating Buzzers...</span>
            <CircularProgressbar
              className="w-10 h-10"
              value={(imageSeconds / 5) * 100}
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
