import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// โหมด dev: เรียก /api ผ่าน proxy ไปที่ ASP.NET Core Web API (เมื่อปิด mock)
// GitHub Pages เปิดที่ https://<user>.github.io/<repo>/ — ต้องตั้ง base เป็นชื่อ repo
// ตอน dev / เครื่องตัวเอง / IIS ใช้ '/' ตามเดิม
const base = process.env.GITHUB_PAGES === 'true' ? `/${process.env.REPO_NAME ?? 'kidney_fellow_up_demo'}/` : '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
