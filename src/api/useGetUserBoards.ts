import axios from "axios";
import { useQuery } from "react-query";
import { apiUrl } from "./constants";
import { Game } from "../../stateTypes";

const getUserBoards = async (userId: string): Promise<Game> => {
  const response = await axios.get(
    `${apiUrl}/api/getUserBoards${userId ? `?userId=${userId}` : ""}`
  );
  return response.data;
};

export const getUserBoardsQueryKey = "getUserBoards";

export const useGetUserBoards = (userId: string) => {
  return useQuery<Game>({
    queryKey: [getUserBoardsQueryKey, userId],
    queryFn: () => getUserBoards(userId),
  });
};
