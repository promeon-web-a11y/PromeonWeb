import { defineConfig } from "vite";
import { resolve } from "node:path";

// 複数ページ（index.html / privacy.html）をビルド対象にするための設定です。
// 新しくHTMLページを追加した場合は、input に追記してください。
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        privacy: resolve(import.meta.dirname, "privacy.html"),
      },
    },
  },
});
