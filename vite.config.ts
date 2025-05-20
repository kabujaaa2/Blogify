import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 12000,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "X-Frame-Options": "ALLOWALL"
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
