// @ts-check
/**
 *
 */
const config = {
  jsx: "react",
  server: {
    open: true,
    host: "0.0.0.0",
    port: 5175
  },
  optimizeDeps: {
    exclude: ["@galacean/engine"],
  },
};

export default config;
