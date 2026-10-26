import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ensureDemoData } from "./services/demoData";
import "./index.css";
import "./demo.css";

// Na primeira visita, carrega as inspeções de exemplo da demonstração.
ensureDemoData();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
