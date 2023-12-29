import { useEffect } from "react";
import { useGlobalState } from "../components/GlobalStateProvider";

export const useGetUpdatedGameState = () => {
  const { socket } = useGlobalState();
  useEffect(() => {
    if (localStorage.getItem("bz-roomId")) {
      socket?.emit(
        "User gets updated game state",
        localStorage.getItem("bz-roomId") || ""
      );
    }
  }, [socket]);
};
