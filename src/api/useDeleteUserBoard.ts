import axios from "axios";
import { UseMutationOptions, useMutation } from "react-query";
import { apiUrl } from "./constants";

const deleteUserBoard = async ({ gameName }: { gameName: string }) => {
  const response = await axios.delete(
    `${apiUrl}/api/deleteUserBoard/${gameName}`
  );
  return response.data;
};

export const useDeleteUserBoard = (
  options?:
    | Omit<
        UseMutationOptions<any, unknown, { gameName: string }, unknown>,
        "mutationFn"
      >
    | undefined
) => {
  return useMutation(deleteUserBoard, options);
};
