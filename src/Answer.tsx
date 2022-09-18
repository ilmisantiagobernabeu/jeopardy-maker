import { useEffect } from "react";
import { useGlobalState } from "./GlobalStateProvider";

type Props = {
  setShowAnswer: Function;
};

const Answer = ({ setShowAnswer }: Props) => {
  const { gameState } = useGlobalState();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowAnswer(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="text-white text-9xl flex flex-col justify-center items-center h-full fixed inset-0 bg-[#060ce9] z-50 gap-y-8">
      <p className="underline">Answer:</p>
      {gameState?.activeClue?.answer}
    </div>
  );
};

export default Answer;
