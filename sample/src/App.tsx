import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Translate as Trans } from "react-dialect";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

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
      <Trans>Next gen translation library</Trans>
      <Trans>The count is {count}</Trans>
      <Trans>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi
        blanditiis, consectetur delectus deserunt dignissimos eius id in
        inventore ipsam iste minus, modi nam nihil non odio perspiciatis quas{" "}
        quo voluptate.
      </Trans>
      <Trans>
        Lorem ipsum {count} dolor sit amet, consectetur adipisicing elit. Animi
        blanditiis, consectetur delectus deserunt dignissimos with {count}
      </Trans>
    </>
  );
}

export default App;
