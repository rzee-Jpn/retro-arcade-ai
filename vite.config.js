import { defineConfig } from "vite";

export default defineConfig({
  base: "/retro-arcade-ai/",

  build: {
    outDir: "dist",
    assetsDir: "assets"
  },

  server: {
    port: 3000,
    open: true
  }
});