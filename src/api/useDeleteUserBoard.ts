import axios from "axios";
import { UseMutationOptions, useMutation } from "react-query";
import { apiUrl } from "./constants";

const deleteUserBoard = async ({
  roomId,
  gameName,
}: {
  roomId: string;
  gameName: string;
}) => {
  const response = await axios.delete(
    `${apiUrl}/api/deleteUserBoard/${roomId}/${gameName}`
  );
  return response.data;
};

export const useDeleteUserBoard = (
  options?:
    | Omit<
        UseMutationOptions<
          any,
          unknown,
          { roomId: string; gameName: string },
          unknown
        >,
        "mutationFn"
      >
    | undefined
) => {
  return useMutation(deleteUserBoard, options);
};
