import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGlobalState } from "../components/GlobalStateProvider";

export const useGetUpdatedGameState = () => {
  const { socket } = useGlobalState();
  const { roomId } = useParams();
  useEffect(() => {
    if (roomId) {
      socket?.emit("Host reloads the board page", roomId || "");
    }
  }, [roomId, socket]);
};
