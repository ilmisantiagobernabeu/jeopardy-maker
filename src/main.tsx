import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppContainer from "./components/AppContainer";
import GlobalStateProvider from "./components/GlobalStateProvider";
import { QueryClient, QueryClientProvider } from "react-query";

const client = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <GlobalStateProvider>
        <BrowserRouter>
          <AppContainer />
        </BrowserRouter>
      </GlobalStateProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
