import axios from "axios";
import { SingleGame } from "../../stateTypes";
import { useMutation } from "react-query";

const API_URL = "http://localhost:3001/api";

const createGame = async (game: SingleGame) => {
  const response = await axios.post(`${API_URL}/createGame`, game);
  return response.data;
};

export const useCreateGameMutation = () => {
  return useMutation((game: SingleGame) => createGame(game));
};
