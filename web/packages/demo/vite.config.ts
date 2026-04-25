import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
const devPort = Number.parseInt(
  process.env.PORT || process.env.VITE_PORT || "31173",
  10,
);

export default defineConfig({
  plugins: [react()],
  base: "",
  server: {
    port: Number.isFinite(devPort) && devPort > 0 ? devPort : 31173,
    host: "127.0.0.1",
  },
});
