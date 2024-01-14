import axios, { AxiosError } from "axios";
import { useQuery } from "react-query";
import { apiUrl } from "./constants";
import { useGlobalState } from "../components/GlobalStateProvider";

const getRoom = async (roomId: string) => {
  const response = await axios.get(`${apiUrl}/api/getRoom/${roomId}`);
  return response.data;
};

export const getRoomQueryKey = "getRoom";

export const useGetRoom = (roomId: string, enabled: boolean) => {
  const { socketChangeCount } = useGlobalState();
  return useQuery<
    { [doesRoomExist: string]: boolean },
    AxiosError<{ [error: string]: string }>
  >({
    queryKey: [getRoomQueryKey, socketChangeCount],
    queryFn: () => getRoom(roomId),
    enabled,
    retry: false,
  });
};
