import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

const name = "galaceanSpineEditor";

export default {
	input: "./src/editor/index.ts",
	// Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
	// https://rollupjs.org/guide/en#external-e-external
	external: ["@galacean/engine"],

	plugins: [
		// Allows node_modules resolution
		resolve({ extensions }),

		// Allow bundling cjs modules. Rollup doesn't understand cjs
		commonjs(),

		// Compile TypeScript/JavaScript files
		babel({
			babelHelpers: 'bundled',
			presets: [["@babel/preset-env"], "@babel/preset-typescript"],
			extensions,
			include: ["src/**/*"],
			plugins: [
				["@babel/plugin-proposal-decorators", { legacy: true }],
				["@babel/plugin-proposal-class-properties", { loose: true }],
				"@babel/plugin-proposal-optional-chaining",
				"@babel/plugin-transform-object-assign",
			],
		}),

		terser()
	],

	output: [
		{
			file: "dist/editor.js",
			format: "cjs",
		},
		{
			file: "dist/editor.esm.js",
			format: "es",
			sourcemap:true
		},
		{
			file: "dist/editor.umd.js",
			format: "umd",
			name,
			globals: {
				"@galacean/engine": "@galacean/engine",
			},
		},
	],
};