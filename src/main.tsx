import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppContainer from "./AppContainer";
import GlobalStateProvider from "./GlobalStateProvider";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStateProvider>
        <AppContainer />
      </GlobalStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
