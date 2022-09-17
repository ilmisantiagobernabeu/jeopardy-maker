import { useGlobalState } from "./GlobalStateProvider"

const HostControls = () => {
  const { gameState } = useGlobalState()
  return (
    <div className="text-white text-9xl flex justify-center items-center h-full fixed inset-0 bg-[#060ce9]">
      {gameState?.activeClue?.answer}
    </div>
  )
}

export default HostControls
