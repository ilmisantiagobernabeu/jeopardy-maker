import axios from "axios";
import { Game } from "../../stateTypes";
import { useMutation } from "react-query";

const API_URL = "http://localhost:3001/api";

const createGame = async (game: Game) => {
  const response = await axios.post(`${API_URL}/createGame`, game);
  return response.data;
};

export const useCreateGameMutation = () => {
  return useMutation((game: Game) => createGame(game));
};
