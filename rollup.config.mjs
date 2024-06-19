import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

/** @type import("rollup").RollupOptions[] */
const configs = [
  {
    input: "src/react/index.ts",
    output: { file: "dist/lib.js", format: "esm" },
    plugins: [nodeResolve(), typescript(), babel({ babelHelpers: "bundled" })],
    external: ["react", "react/jsx-runtime"],
  },
  {
    input: "src/cmd/index.ts",
    output: { file: "dist/cmd.js", format: "commonjs" },
    plugins: [nodeResolve(), commonjs(), typescript()],
    external: ["commander"],
  },
];

export default configs;
