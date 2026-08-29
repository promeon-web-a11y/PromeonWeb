import { defineConfig } from "vite";
import { resolve } from "node:path";

// 複数ページ（MPA）をビルド対象にするための設定です。
// 新しくHTMLページを追加した場合は、input に追記してください。
//   キー名は任意（重複しなければOK）／値は HTML ファイルへの絶対パス。
//   例: plans → plans/index.html は本番で /plans/ として配信されます。
export default defineConfig({
  // /plans/ などディレクトリ形式のURLを直接開いた・再読み込みした場合でも
  // 対応する index.html を返す（404 を防ぐ）。
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        plans: resolve(import.meta.dirname, "plans/index.html"),
        samples: resolve(import.meta.dirname, "samples/index.html"),
        flow: resolve(import.meta.dirname, "flow/index.html"),
        faq: resolve(import.meta.dirname, "faq/index.html"),
        contact: resolve(import.meta.dirname, "contact/index.html"),
        privacy: resolve(import.meta.dirname, "privacy.html"),
        terms: resolve(import.meta.dirname, "terms/index.html"),
        tokushoho: resolve(import.meta.dirname, "tokushoho/index.html"),
        "order-terms": resolve(import.meta.dirname, "order-terms/index.html"),
      },
    },
  },
});
