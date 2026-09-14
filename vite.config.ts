import { defineConfig } from "vite";
export default defineConfig({
  base: process.env.DEMO_BASE || "/",
  build: {
    rollupOptions: {
      input: { index: "index.html", react: "examples/react.html" },
    },
  },
});
