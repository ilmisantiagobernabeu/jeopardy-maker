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

export type ContextType = {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  setSocket: any;
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
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
  const localSession = localStorage.getItem("bz-session")
    ? JSON.parse(localStorage.getItem("bz-session") || "")
    : null;
  const [session, setSession] = useState<Session | null>(localSession);

  useEffect(() => {
    // connect to the socket server
    setSocket(io(SOCKET_SERVER_URL));
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
      console.log("hello thar", gameStateFromServer.guid);
    });
  }, [socket]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem("bz-session", JSON.stringify(session));
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
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
