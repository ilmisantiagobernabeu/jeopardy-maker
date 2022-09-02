import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppContainer from "./AppContainer";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContainer />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
