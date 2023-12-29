import axios from "axios";
import { useMutation } from "react-query";
import { apiUrl } from "./constants";
import { SingleGame } from "../../stateTypes";

const createNewBoard = async (data: {
  previousGameName: string;
  game: SingleGame;
  roomId: string;
  userId: string;
  clueType: string | undefined;
}) => {
  const response = await axios.post(`${apiUrl}/api/createNewBoard`, data);
  return response.data;
};

export const useCreateNewBoard = () => {
  return useMutation(createNewBoard);
};
