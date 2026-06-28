import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // rutas relativas: necesario para que funcione dentro de Electron (file://)
  build: {
    outDir: "dist",
  },
});
