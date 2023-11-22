import { useGetUpdatedGameState } from "../hooks/useGetUpdatedGameState";
import { useGlobalState } from "./GlobalStateProvider";
import { PageWrapper } from "./PageWrapper";

const HostControls = () => {
  const { gameState } = useGlobalState();
  useGetUpdatedGameState();
  return (
    <PageWrapper>
      <div>
        <h2 className="font-bold text-2xl leading-none text-center normal-case mb-2">
          Answer
        </h2>
        <p>
          {gameState?.activeClue?.answer ||
            "Once a clue is active, you can see the answer here."}
        </p>
      </div>
    </PageWrapper>
  );
};

export default HostControls;
