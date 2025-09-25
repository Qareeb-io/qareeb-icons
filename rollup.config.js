import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import ttypescript from "ttypescript";
import pkg from "./package.json";

export default {
  input: {
    index: "src/index.ts",
    "qfarm/index": "src/qfarm/index.ts",
    "wizabot/index": "src/wizabot/index.ts",
  },
  output: [
    {
      format: "cjs",
      dir: "dist/cjs",
      exports: "named",
      entryFileNames: "[name].js"
    },
    {
      format: "es",
      dir: "dist/esm",
      exports: "named",
      entryFileNames: "[name].js"
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    del({ targets: "dist/*" }),
    peerDepsExternal(),
    typescript({
      clean: true,
      useTsconfigDeclarationDir: true,
      typescript: ttypescript,
      tsconfig: "./tsconfig.json",
    }),
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: "runtime",
      exclude: "node_modules/**",
      extensions: [".ts", ".tsx"],
    }),
    terser(),
  ],
};
