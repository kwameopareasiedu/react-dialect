import ReactDOM from "react-dom/client";
import { TranslationProvider } from "react-dialect";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TranslationProvider languages={["en", "fr", "ge"]} baseLanguage="en">
    <App />
  </TranslationProvider>,
);
