import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import GlobalStateProvider from "./components/GlobalStateProvider";
import { QueryClient, QueryClientProvider } from "react-query";
import GameSettingsProvider from "./components/GameSettingsProvider";

const client = new QueryClient();

ReactDOM.render(
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
  </React.StrictMode>,
  document.getElementById("root")
);
