import axios from "axios";
import { useMutation } from "react-query";
import { SERVER_URL } from "./constants";

const deleteGame = async (gameName: string) => {
  const response = await axios.post(`${SERVER_URL}/deleteGame`, {
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
