import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { babel } from "@rollup/plugin-babel";

/** @type import("rollup").RollupOptions[] */
const configs = [
  {
    input: "src/react/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
    },
    plugins: [nodeResolve(), typescript(), babel({ babelHelpers: "bundled" })],
    external: ["react", "react/jsx-runtime"],
  },
];

export default configs;
