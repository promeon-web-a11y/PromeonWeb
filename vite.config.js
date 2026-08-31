import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";
import contactHandler from "./api/contact.js";

// 複数ページ（MPA）をビルド対象にするための設定です。
// 新しくHTMLページを追加した場合は、input に追記してください。
//   キー名は任意（重複しなければOK）／値は HTML ファイルへの絶対パス。
//   例: plans → plans/index.html は本番で /plans/ として配信されます。
export default defineConfig(({ mode }) => {
  // .env / .env.local から全キーを読み込み、開発用 API 関数に渡せるようにする
  // （VITE_ 接頭辞なしのキーも含めて process.env に載せる。クライアントには出さない）
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
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
    plugins: [
      {
        // 開発サーバー（npm run dev）でも /api/contact を動かすためのプラグイン。
        // 本番（Vercel）では api/contact.js がサーバーレス関数として自動で動くため、
        // このプラグインは開発時のみ有効です。
        name: "dev-api-contact",
        apply: "serve",
        configureServer(server) {
          server.middlewares.use("/api/contact", async (req, res) => {
            try {
              await contactHandler(req, res);
            } catch (err) {
              server.config.logger.error(`[dev-api-contact] ${err}`);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ ok: false, error: "dev_handler_error" }));
            }
          });
        },
      },
    ],
  };
});
