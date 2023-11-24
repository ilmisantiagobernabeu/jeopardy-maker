import { useEffect } from "react";
import { useGlobalState } from "../components/GlobalStateProvider";

export const useGetUpdatedGameState = () => {
  const { socket } = useGlobalState();
  useEffect(() => {
    if (localStorage.getItem("bz-roomId")) {
      socket?.emit(
        "Host reloads the board page",
        localStorage.getItem("bz-roomId") || ""
      );
    }
  }, [socket]);
};
