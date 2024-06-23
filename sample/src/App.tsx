import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Translate as Trans, useTranslation } from "react-dialect";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const { setLanguage } = useTranslation();

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>

        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div className="flex items-center justify-between gap-8">
        <button onClick={() => setLanguage("en")}>En</button>
        <button onClick={() => setLanguage("fr")}>Fr</button>
        <button onClick={() => setLanguage("ge")}>Ge</button>
      </div>

      <Trans>Next gen translation library</Trans>
      <Trans>It supports interpolation like so: {count}</Trans>
      <Trans>
        Even with long paragraph statements that get formatted into multiple
        lines with tools like Prettier, react-dialect just works.
      </Trans>
      <Trans>
        Even better, long paragraph statements that get reformatted can still
        contain interpolated values like so: {count} and a second like so:{" "}
        {count} and still be parsed by react-dialect
      </Trans>
    </>
  );
}

export default App;
