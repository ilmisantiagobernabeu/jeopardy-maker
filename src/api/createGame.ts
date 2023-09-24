import axios from "axios";
import { SingleGame } from "../../stateTypes";
import { useMutation } from "react-query";
import { SERVER_URL } from "./constants";

const createGame = async (game: SingleGame) => {
  const response = await axios.post(`${SERVER_URL}/createGame`, game);
  return response.data;
};

export const useCreateGameMutation = () => {
  return useMutation((game: SingleGame) => createGame(game));
};
