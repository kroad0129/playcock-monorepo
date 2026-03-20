import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ← 외부 접근 허용 (핵심)
    port: 5173, // 필요 시 변경 가능
  },
});
