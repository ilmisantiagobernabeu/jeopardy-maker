import { useGlobalState } from "./GlobalStateProvider";

const HostControls = () => {
  const { gameState } = useGlobalState();
  return (
    <div className="text-white">
      Answer to Clue: {gameState?.activeClue?.answer}
    </div>
  );
};

export default HostControls;
