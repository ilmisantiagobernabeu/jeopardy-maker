import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import GlobalStateProvider from "./components/GlobalStateProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import GameSettingsProvider from "./components/GameSettingsProvider";

const client = new QueryClient();

const container = document.getElementById("root") as HTMLElement;

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <GameSettingsProvider>
        <GlobalStateProvider>
          <BrowserRouter>
            <AppContainer />
          </BrowserRouter>
        </GlobalStateProvider>
      </GameSettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
