# 採用支援事業サイト（RECRUIT BRIDGE / 仮）

建築業・警備業に特化した採用支援サービスの LP 兼コーポレートサイト。
「誠実さ・透明感・先進性」を、明朝ベースのタイポグラフィと緩急のあるモーションで表現する。

## セットアップ

```bash
npm install
npm run dev      # 開発サーバー http://localhost:5173
npm run build    # 本番ビルド → dist/
npm run preview  # ビルド結果の確認
```

## 技術構成

- **Vite（MPA）** — ページ追加時は `vite.config.js` の `input` に追記
- **GSAP + ScrollTrigger** — スクロール演出・ロード演出・カウントアップ
- **Lenis** — 慣性スクロール（`prefers-reduced-motion` 時は無効）
- **Swiper** — カルーセルの器（`[data-carousel]` がある時だけ動的 import）

## ディレクトリ

```
index.html                トップページ（雛形。中身は JS が描画）
checklist/index.html      採用課題診断ページ
public/
  favicon.svg
  images/                 実画像の置き場所（README 参照。未配置時は自動でプレースホルダー）
src/
  config.js               ★文言・数値・リンク・診断ロジックの一次情報はここだけ
  main.js                 トップページのエントリ
  checklist.js            診断ページのエントリ
  components/             セクション単位の描画関数（他ページへ流用可）
  motion/                 アニメーションを機能ごとに分割
    env.js                prefers-reduced-motion 判定
    smoothScroll.js       Lenis
    reveal.js             汎用スクロールイン（stagger 対応）
    header.js             透明→白背景、ロゴ縮小、モバイルメニュー
    hero.js               ①白レイヤー→写真→コピーの GSAP timeline
    counters.js           ③数値カウントアップ
    roadmap.js            ⑥プログレスライン
    accordion.js          ⑤サービス / ⑨FAQ
    parallax.js           ⑩CTA 背景パララックス
    carousel.js           Swiper（将来用）
    wizard.js             診断ウィザード（ステップ遷移・進捗・結果分岐）
    index.js              トップページ用の初期化オーケストレーター
  styles/
    tokens.css            デザイントークン（色・フォント・余白・モーション）
    base.css              リセット・タイポ・レイアウト土台・reveal 初期状態
    components.css        ヘッダー / フッター / アコーディオン / 統計
    top.css               トップの各セクション
    checklist.css         診断ページ
```

## 文言・数値を変えたいとき

`src/config.js` を編集する。マークアップ（`*.html` / `components/*`）や
スクリプトは原則触らずに運用できる設計。

## アクセシビリティ / パフォーマンス

- すべての演出は `prefers-reduced-motion: reduce` を尊重（即時表示に切替、Lenis 停止）
- `[data-reveal]` は JS 無効時・低減時に初期状態を解除して確実に表示
- ヒーロー画像は `fetchpriority="high"`、その他は `loading="lazy"` ＋ WebP 併記
- Swiper は該当セクションがある時のみ読み込み（トップの初期ロードには含めない）

## TODO（本番前）

- `src/config.js` の会社名・代表者名・連絡先・料金導線を確定値へ
- `public/images/` に実画像を配置（`public/images/README.md` 参照）
- `index.html` / `checklist/index.html` の canonical / OGP を本番ドメインへ
- `/service/` `/about/` `/contact/` ページの実装
- ロードマップ資料 PDF（`/downloads/roadmap-3months.pdf`）の用意
