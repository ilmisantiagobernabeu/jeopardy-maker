import React, { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Session } from "@supabase/supabase-js";
import {
  ClientToServerEvents,
  GameState,
  ServerToClientEvents,
} from "../../stateTypes";
import { SOCKET_SERVER_URL } from "../api/constants";
import { supabase } from "../api/supabase";
import { queryClient } from "../main";
import { getRoomQueryKey } from "../api/useGetRoom";

export type ContextType = {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  setSocket: any;
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  roundOver: boolean;
  setRoundOver: React.Dispatch<React.SetStateAction<boolean>>;
  socketChangeCount: number;
};

const GlobalStateContext = React.createContext<ContextType | null>(
  null
) as React.Context<ContextType>;

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [socketChangeCount, setSocketChangeCount] = useState(0);
  const localSession = localStorage.getItem("bz-session")
    ? JSON.parse(localStorage.getItem("bz-session") || "")
    : null;
  const [session, setSession] = useState<Session | null>(localSession);

  const [roundOver, setRoundOver] = useState(false);

  useEffect(() => {
    // connect to the socket server
    const socket = io(SOCKET_SERVER_URL);

    socket.on("connect", () => {
      setSocket(socket);
      setSocketChangeCount((prevCount) => (prevCount += 1));
      socket.emit(
        "User gets updated game state",
        localStorage.getItem("bz-roomId") || ""
      );
      console.log("Socket reconnected");
    });

    socket.on("disconnect", () => {
      setSocket(socket);
      setSocketChangeCount((prevCount) => (prevCount += 1));
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    // listen for when the server emits the updated game state
    socket?.on("gameState updated", function (gameStateFromServer: GameState) {
      // set the new game state on the client
      setGameState(gameStateFromServer);
      localStorage.setItem("bz-roomId", gameStateFromServer.guid);
      queryClient.invalidateQueries(getRoomQueryKey);
    });

    socket?.on("Buzzers are activated", function () {
      setGameState((prevGameState) => ({
        ...(prevGameState as any),
        isBuzzerActive: true,
      }));
    });
  }, [socket]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem("bz-session", JSON.stringify(session));
        console.log("Session found!", session?.user.id);
      } else {
        localStorage.removeItem("bz-session");
      }
      localStorage.setItem("bz-userId", session?.user.id || "");
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem("bz-session", JSON.stringify(session));
        console.log("Session updated!", session?.user.id);
      } else {
        localStorage.removeItem("bz-session");
      }
      localStorage.setItem("bz-userId", session?.user.id || "");
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GlobalStateContext.Provider
      value={{
        gameState,
        setGameState,
        socket,
        setSocket,
        session,
        setSession,
        roundOver,
        setRoundOver,
        socketChangeCount,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
