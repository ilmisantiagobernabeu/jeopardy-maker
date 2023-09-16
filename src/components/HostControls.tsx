import { useGlobalState } from "./GlobalStateProvider";
import { HamburgerMenu } from "./HamburgerMenu";

const HostControls = () => {
  const { gameState } = useGlobalState();
  return (
    <div className="text-white flex justify-center items-center h-full fixed inset-0 bg-[#060ce9]">
      <HamburgerMenu />
      <div className="text-center flex flex-col gap-2">
        <h2 className="font-bold text-2xl leading-none text-center normal-case">
          Answer
        </h2>
        <p>
          {gameState?.activeClue?.answer ||
            "Once a clue is active, you can see the answer here."}
        </p>
      </div>
    </div>
  );
};

export default HostControls;
