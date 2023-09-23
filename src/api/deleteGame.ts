import axios from "axios";
import { useMutation } from "react-query";

const API_URL = "http://localhost:3001/api";

const deleteGame = async (gameName: string) => {
  const response = await axios.post(`${API_URL}/deleteGame`, {
    name: gameName,
  });
  return response.data;
};

export const useDeleteGameMutation = () => {
  return useMutation((gameName: string) => {
    console.log("hahaha", gameName);
    return deleteGame(gameName);
  });
};
