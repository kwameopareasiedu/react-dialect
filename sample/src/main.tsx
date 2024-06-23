import React from "react";
import ReactDOM from "react-dom/client";
import { TranslationProvider } from "react-dialect";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TranslationProvider languages={["en", "fr", "ge"]} baseLanguage="en">
      <App />
    </TranslationProvider>
  </React.StrictMode>,
);
