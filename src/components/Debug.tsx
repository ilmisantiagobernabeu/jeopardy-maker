import { useGlobalState } from "./GlobalStateProvider";

export const Debug = () => {
  const { gameState } = useGlobalState();

  const { games, gameBoard, ...rest } = gameState || {};

  return <pre className="text-white">{JSON.stringify(rest, null, 2)}</pre>;
};
