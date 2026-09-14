import { defineConfig } from "vite";
export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist/library",
    lib: {
      entry: { index: "src/index.ts", react: "src/react.tsx" },
      formats: ["es"],
    },
    rollupOptions: {
      external: (id) => /^(gsap|react|react-dom)(\/|$)/.test(id),
      output: { entryFileNames: "[name].js" },
    },
  },
});
