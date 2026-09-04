import { defineConfig } from "vite";
import { resolve } from "node:path";

// 複数ページ（MPA）構成。
// 新しいHTMLページを追加したら input に追記してください。
//   キー名は任意／値は HTML ファイルの絶対パス。
//   例: service → service/index.html は本番で /service/ として配信されます。
export default defineConfig({
  // ディレクトリ形式URL（/checklist/ など）を直接開いても index.html を返す
  appType: "mpa",
  // promeon-web サンプル配下（/recruit-support/dist/）にサブディレクトリとして
  // 置いて相対リンクで開けるよう、アセット参照を相対パスにする。
  base: "./",
  build: {
    target: "es2019",
    cssTarget: "chrome80",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        checklist: resolve(import.meta.dirname, "checklist/index.html"),
      },
    },
  },
});
