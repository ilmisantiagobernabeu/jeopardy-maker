import axios from "axios";
import { useQuery } from "react-query";
import { apiUrl } from "./constants";
import { Game } from "../../stateTypes";

const getUserBoards = async (roomId: string, userId: string) => {
  const response = await axios.get(
    `${apiUrl}/api/getUserBoards/${roomId}${userId ? `?userId=${userId}` : ""}`
  );
  return response.data;
};

export const getUserBoardsQueryKey = "getUserBoards";

export const useGetUserBoards = (roomId: string, userId: string) => {
  return useQuery<Game>({
    queryKey: [getUserBoardsQueryKey, userId],
    queryFn: () => getUserBoards(roomId, userId),
    enabled: Boolean(roomId),
  });
};
