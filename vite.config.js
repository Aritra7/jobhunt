import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { aiPlugin } from "./server/aiPlugin.js";

export default defineConfig({
  // aiPlugin serves /api/ai/* from the dev/preview server; it reads api.key.
  plugins: [react(), aiPlugin()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
});
