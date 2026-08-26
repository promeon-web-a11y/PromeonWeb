# Promeon Web（公式サイト）

中小企業・個人事業主・店舗向けのWeb制作サービス「Promeon Web」の公式サイトです。

## 技術構成

- HTML / CSS / JavaScript（フレームワーク不使用のシンプル構成）
- 開発サーバー・ビルドツール：[Vite](https://vitejs.dev/)

## セットアップ

```bash
npm install
npm run dev
```

`npm run dev` 実行後、ターミナルに表示されるURL（通常 http://localhost:5173 ）にアクセスすると
ローカル環境でサイトを確認できます。スマートフォン表示はブラウザの検証ツール（デバイスモード）で確認してください。

本番用に書き出す場合：

```bash
npm run build   # dist/ フォルダに静的ファイルを生成
npm run preview # ビルド結果をローカルで確認
```

## ファイル構成

```
promeon-web/
├─ index.html          … トップページ（各セクションを1ページにまとめた構成）
├─ privacy.html         … プライバシーポリシーページ
├─ src/
│  ├─ config.js         … ★最重要：料金・SNSリンク・サービス内容・キャッチコピー等のデータ
│  ├─ main.js            … config.js の内容をページに反映するスクリプト
│  └─ style.css          … デザイン（配色・余白・レイアウト）
├─ public/
│  ├─ favicon.svg        … 仮favicon（ロゴ確定後に差し替え）
│  └─ og-image.svg       … 仮OGP画像（SNSシェア用。png/jpgへの差し替え推奨）
├─ package.json
└─ README.md
```

## 編集すべき設定ファイル

### 1. `src/config.js`（最初に編集してください）

以下はすべてこのファイルで一元管理しています。HTMLを直接編集する必要はありません。

| 変更したい内容 | 該当箇所 |
| --- | --- |
| 公式LINE / Instagram / Facebook / メールアドレス（Gmail） | `contact` |
| キャッチコピー・サブコピー | `catchCopy` / `subCopy` |
| 料金プラン（Mini / Standard / Pro） | `pricingPlans` |
| 支払い方法 | `paymentMethods` |
| ヒアリングシートのURL | `hearingSheetUrl` |
| サービス内容一覧 | `services` |
| 選ばれる理由 | `strengths` |
| よくある悩み | `painPoints` |
| 制作の流れ | `flowSteps` |
| 制作サンプル（プラン別デモサイト枠） | `samples` |
| FAQ | `faqs` |

**SNS・メールについて：** URLが未確定の項目は空文字 `""` のままにしてください。
サイト上では自動的に「準備中」と表示され、リンクとして機能しない状態になります。
本番URLが決まったら、`""` の中に直接入力するだけで反映されます。

**ヒアリングシートのURL：** `hearingSheetUrl` に入力します。空文字 `""` の間は
「制作の流れ」内に「お申し込み後にご案内します」と表示され、リンクは出ません。
URL（例: `"https://forms.gle/xxxxxxxx"`）を入れると「ヒアリングシートを開く」リンクが表示されます。

**制作サンプル（`samples`）：** 各サンプルは Mini / Standard / Pro の順に、
パソコンでは左から、スマートフォンでは上から表示されます。1件は以下の形式です。

```js
{
  plan: "Mini",                 // Mini / Standard / Pro
  industry: "リフォーム会社",     // 業種
  title: "リフォーム会社サイト（サンプル）",
  desc: "説明文",
  status: "preparing",          // "preparing"（準備中）/ "published"（公開中）
  demoUrl: "",                  // 公開するサンプルサイトのURL
  imageUrl: "",                 // サムネイル画像URL（任意。public/images/ に配置）
}
```

**サンプルの公開状態の切り替え：**

- `status: "preparing"` … ボタンは「準備中」表示でクリック不可（リンクは張られません）。
- `demoUrl` にURLを入れて `status: "published"` にする … ボタンが「サンプルサイトを見る」に変わり、
  別タブでそのURLを開きます。`status` が `"published"` でも `demoUrl` が空なら「準備中」のままです。

### 2. `public/favicon.svg` / `public/og-image.svg`

ロゴやOGP画像が決まり次第、同名ファイルとして差し替えてください
（`og-image.svg` は png/jpg に差し替える場合、`index.html` 内の `og:image` のパスも変更してください）。

## 注意事項（意図的にしていること）

- 架空の顧客の声・制作実績・住所・電話番号は掲載していません。
- 「制作実績」ではなく「制作サンプル」という表現にしています（実際の顧客実績ではないため）。
- 「最短1時間で納品」は断定表現を避け、「内容による」旨を明記しています。
- 支払い方法は「銀行振込」「クレジットカード」の2種類のみ掲載しています。
- SEO対策として `title` / `meta description` / OGP / favicon / semantic HTML（header, nav, main, section, footer）を設定しています。
- 料金・SNS・FAQ等の主要データは `src/config.js` から動的に描画しているため、`noscript` に最低限のフォールバック文言を用意しています。将来的に検索エンジン最適化をさらに強化する場合は、静的サイト生成（SSG）への移行も検討してください。
