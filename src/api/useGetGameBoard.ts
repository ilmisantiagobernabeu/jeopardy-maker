import axios from "axios";
import { useQuery } from "react-query";
import { apiUrl } from "./constants";
import { Game } from "../../stateTypes";

const getGameBoard = async (roomId: string, gameName: string) => {
  const response = await axios.get(
    `${apiUrl}/api/getGameBoard/${roomId}/${gameName}`
  );
  return response.data;
};

export const getGameBoardQueryKey = "getGameBoard";

export const useGetGameBoard = (
  roomId: string,
  gameName: string,
  enabled = true,
  onSuccess?: () => void
) => {
  return useQuery<Game>({
    queryKey: [getGameBoardQueryKey],
    queryFn: () => getGameBoard(roomId, gameName),
    enabled: Boolean(roomId && gameName && enabled),
    onSuccess,
  });
};
