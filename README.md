# Promeon Web（公式サイト）

中小企業・個人事業主向けのWeb制作サービス「Promeon Web」の公式サイトです。
「チャットだけで、伝わるWebサイトを。」をコンセプトに、サービス・料金・制作サンプル・
制作の流れ・よくある質問・お問い合わせ（無料相談・無料見積り）を案内する営業サイトです。

## 技術構成

- HTML / CSS / JavaScript（フレームワーク不使用）
- 開発サーバー・ビルド：[Vite](https://vitejs.dev/)（MPA 構成、`appType: "mpa"`）
- 表示内容（料金・FAQ・サンプル・比較表など）は `src/config.js` に一元化し、
  `src/components.js` の部品を通じて `src/main.js` が各ページへ描画します。

## ローカルで開くコマンド

```bash
npm install      # 初回のみ（依存は vite のみ）
npm run dev      # 開発サーバー（通常 http://localhost:5173 ）
npm run build    # 本番用ファイルを dist/ に生成
npm run preview  # ビルド結果を確認（/plans/ など末尾スラッシュ付きで開く）
```

lint / test スクリプトはプロジェクトに用意されていません。

## サイト構成とURL

| ページ | URL | ソース | 主な内容 |
| --- | --- | --- | --- |
| トップ | `/` | `index.html` | FV／悩み／選ばれる理由／サンプル／料金プラン／AI活用／制作の流れ／FAQ抜粋（大きな最終CTAは無し） |
| 料金・プラン | `/plans/` | `plans/index.html` | 基本プランについて／詳細プランカード／比較表／完全オーダーメイド制作／有料オプションの例 |
| 制作サンプル | `/samples/` | `samples/index.html` | プラン別の架空サンプル（構成・機能・向いている事業者・別タブで表示） |
| 制作の流れ | `/flow/` | `flow/index.html` | 5ステップ（お客様の作業／Promeonの作業／確認タイミング）＋必要素材＋最短3時間の条件 |
| よくある質問 | `/faq/` | `faq/index.html` | 12項目（回答を最初から表示。開閉なし） |
| お問い合わせ | `/contact/` | `contact/index.html` | 公式LINE（おすすめ・ボタン＋PC用QR＋相談イメージ）／メール（定型文 `mailto:`）／SNS案内（Facebook・Instagram/X近日公開）／記入項目／**ページ最下部の問い合わせフォーム（`#inquiry-form`）** |
| プライバシーポリシー | `/privacy.html` | `privacy.html` | `noindex` |

- 各ページは実体HTMLのため、URL直接アクセス・リロードでも404になりません。
- サイト内リンクはすべて末尾スラッシュ付き（`/plans/` 等）。公開ホストは
  「ディレクトリURLで `index.html` を返す」既定動作を利用します。
- **ページ追加時は `vite.config.js` の `build.rollupOptions.input` に必ず追記**してください。

## 主要ファイルの役割

```
promeon-web/
├─ index.html / plans/ samples/ flow/ faq/ contact/ … 各ページの骨組み（見出しと空コンテナ＋SEOタグ）
├─ privacy.html
├─ src/
│  ├─ config.js     … ★最重要：料金・比較表・オプション・連絡先・FAQ・サンプル・流れ等のデータ
│  ├─ components.js … 共通UI部品（Header/Footer/PlanCard/PlanComparisonTable/BasicPlanNote/CustomPlanBlock/PaidOptionsBlock/SampleCard/FAQItem/SectionHeading）
│  ├─ main.js       … config + components を読み、各ページへ描画。canonical・モバイルナビ・固定CTAの制御も担当
│  └─ style.css     … デザイン。既存ルールは変更せず末尾に追記する方針（オレンジ×白基調・ネイビーをアクセント）
├─ public/
│  ├─ favicon.png / og-image.svg … ファビコン（タブ＋iOS）・仮OGP画像（public/ 直下）
│  │   favicon.png を同名で上書き → npm run build → スーパーリロードで反映（下表参照）
│  ├─ assets/images/{logo,photos,qr}/ … 役割別の画像フォルダ（public/assets/images/README.md 参照）
│  └─ samples/mini/ , samples/standard/ … 各プランのデモサイト実体（ビルド時 dist/samples/ へコピー）
├─ vite.config.js
└─ README.md
```

## よくある編集 — どこを変えるか（すべて `src/config.js`）

| 変更したい内容 | キー |
| --- | --- |
| ヘッダーのロゴ画像（未設定なら文字「Promeon Web」） | `logoImage` |
| ナビ項目・順番（「お問い合わせ」は `nav` に置かず、ヘッダー末尾へ自動追加） | `nav` |
| ヘッダー末尾の「お問い合わせ」リンク／ページ内・フッターの「無料相談・無料見積り」（リンク先は `/contact/`。LINE直リンクにはしない） | `primaryCta`（`headerLabel` / `label` / `labelShort` / `href`） |
| CTA下の補足文（相談・見積り無料） | `ctaSupportNote` |
| スマホ画面下部の固定CTA（`/contact/` と `/plans/` へ。LINEは載せない） | `stickyCta` |
| お問い合わせの公式LINE案内文・メール案内文 | `contactGuide`（`lineHeading` / `lineBody` / `mailHeading` / `mailBody2`） |
| 写真・制作画面の画像パス（仮画像 `.svg`／本番 `.webp`） | `images`（`public/assets/images/README.md` 参照） |
| 問い合わせページ／フッターの SNS（Facebook / Instagram / X） | `contactSns` ＋ `contact.facebook`（URL） |
| メインコピー・補足コピー・FVバッジ | `catchCopy` / `subCopy` / `heroBadges` |
| 「最短3時間」の注意書き | `heroCaption` |
| 顧客の悩み4項目・その後の説明文 | `painPoints` / `painSolution` |
| 選ばれる理由（4カード） | `reasons` |
| AI活用の工程・ツール名・理由 | `aiProcess`（`steps` / `tools` / `reason`） |
| 基本プラン（金額・ページ数・セクション数・用途・修正回数・納期・納品形式・含む内容） | `pricingPlans` |
| 「基本プランについて」の見出し・本文 | `basicPlanNote` |
| 「完全オーダーメイド制作」の見出し・本文・料金表記・補足 | `customPlan` |
| **有料オプションの例（プラン全体共通）** | `paidOptions`（`items` / `note`） |
| プラン比較表の行・値 | `planComparison`（`columns` / `rows`） |
| 料金ページの補足事項 | `pricingNotes` |
| 支払い方法 | `paymentMethods` |
| 制作サンプル（業種・構成・機能・公開状態・URL） | `samples` |
| 制作の流れ（5ステップ／お客様・Promeonの作業／確認タイミング） | `flowSteps` |
| 必要素材リスト・素材なし時の案内・修正/納品の補足 | `flowDetails` |
| 最短3時間の条件 | `fastDeliveryConditions` |
| FAQ（12項目） | `faqs` |
| お問い合わせの案内文・記入項目・メール定型文 | `contactGuide` |
| メール・公式LINE・Instagram・Facebook | `contact` |
| 公式LINEのQRコード画像パス | `lineQrImage` |
| ヒアリングシートのURL | `hearingSheetUrl` |

### 料金について

- `pricingPlans[].price` は数値のみ（表示時に「49,800円（税込）から」へ整形）。
- 現在の掲載価格（すべて税込・**基本プラン＝標準的な制作内容。内容により変動**）：
  **Mini 49,800円 / Standard 99,800円 / Pro 149,800円**（Standard に「おすすめ」）。
  ※ Mini はココナラでは価格設定の都合上 50,000 円ですが、公式サイトの正式価格は **49,800円** です。
- 基本プランに当てはまらない場合は「完全オーダーメイド制作（要お見積り）」を `/plans/` の比較表の下に掲載。
- Standard・Pro の `sections` / `revisions` / `delivery` / `deliveryFormat` は現在「要相談」。
  確定したら文言を差し替え、比較表 `planComparison.rows` の該当値も併せて更新してください。
- 有料オプションは Mini 専用ではなく、`paidOptions` に「例」として掲載（固定の追加料金は表示しない）。

### 連絡先・公式LINE・SNS

- `contact.email`：`mailto:` に使用（現在 `satokazu.promeon@gmail.com`）。
- `contact.line`：公式LINE（現在 `https://lin.ee/onG5cTt`）。**問い合わせページの「おすすめ窓口」としてのみ**表示（ヘッダー主要CTAにはしない）。値があれば新しいタブ＋`rel="noopener noreferrer"`。空にすると LINE ボタン・QR は自動非表示。
- `contact.facebook`：**未設定**。正式URLをこの1か所に入れると、問い合わせページの「Facebookを見る」ボタンとフッターのFacebookリンクが有効化されます（空の間は「近日公開予定」表示）。FacebookのQRコードは掲載しません。
- `contact.instagram` ／ X：URL・`#` は設定せず「近日公開予定」表示のみ（`contactSns`）。
- 公式LINEのQRコード：`public/assets/images/qr/line-official-qr.png`（`contact.line` のURLから生成）。`/contact/` のPC表示で使用。作り直す場合は同名で上書き。
- フッターのSNSは小さなテキストリンク（Facebookはurlがある時のみ有効、Instagram/Xは常に無効表示）。フッターにQRコードは置きません。

### 制作サンプルのURL・公開状態

`samples` 配列で管理します。`status: "published"` かつ `demoUrl` あり →「サンプルを見る」ボタンが別タブで開きます。
`status: "preparing"` または `demoUrl` 空 →「準備中」。デモ本体は `public/samples/<plan>/` に置くとビルドで `dist/samples/<plan>/` へコピーされます。
現在：Mini `/samples/mini/index.html`（公開）、Standard `/samples/standard/index.html`（公開）、Pro は準備中。
すべて `isFictional: true` のため「サービス紹介用の架空サンプルです」と表示されます。

## 画像 — 差し替え場所

役割別フォルダと詳しい手順は **`public/assets/images/README.md`** を参照してください。

| ファイル | 置き場所 | 表示場所 | 推奨サイズ | 差し替え方法 |
| --- | --- | --- | --- | --- |
| `favicon.png` | `public/` 直下 | **全ページのタブ（メインのファビコン）** ＋ iOSホーム画面アイコン | 正方形PNG。512×512px（大きめの1枚でOK。ブラウザ／OSが縮小） | **同名で上書きするだけで自動反映**（全HTMLに `<link rel="icon" type="image/png" href="/favicon.png">` と `<link rel="apple-touch-icon" href="/favicon.png">` を設定済み）。差し替え後は `npm run build` とブラウザのスーパーリロード（Ctrl+Shift+R）が必要 |
| `favicon.ico`（任意） | `public/` 直下 | ごく一部の古い環境のフォールバック | 16／32／48px を含む**本物のマルチ解像度 ICO**（PNGを拡張子だけ `.ico` にしたものは不可） | 置くとブラウザが `/favicon.ico` を自動参照。無くても `favicon.png` で表示されます |
| `favicon.svg`（任意） | `public/` 直下 | 現在は未参照（`<link>` から外してあります） | 正方形SVG | 使う場合は各HTMLに `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` を追加。ただしChrome等はSVGを優先するため、PNGを見せたい間は追加しないでください |
| `og-image.svg` | `public/` 直下 | SNSシェアのカード | 1200×630px（png/jpg推奨） | 同名で上書き。形式を変える場合は各HTMLの `og:image` パスも変更 |
| `assets/images/qr/line-official-qr.png` | `public/assets/images/qr/` | `/contact/` のQR欄（PC・表示160px） | 600px四方以上 PNG | 同名で上書き |
| `assets/images/photos/*.svg`（→本番は `.webp`） | `public/assets/images/photos/` | トップ／制作の流れ／AI／完全オーダーメイド／問い合わせ | 表は `public/assets/images/README.md` | 本番画像を `.webp` で保存し `config.js` の `images` の拡張子を変更 |
| `assets/images/samples/sample-{mini,standard,pro}.svg` | `public/assets/images/samples/` | 制作サンプル各カード（`/samples/`） | 1440×900px | 同上（`samples[].imageUrl`） |
| **ロゴ画像** | `public/assets/images/logo/promeon-logo.svg` | 固定ヘッダー左＋フッター下段中央（`src/config.js` `logoImage` とフッターの `<img>` が同パスを参照） | 表示：ヘッダー PC 横160〜200px／SP 横130〜160px、フッター 横180px／SP 150px。縦横比維持・`object-fit: contain` | **同名で上書き**すればヘッダー・フッターとも自動反映。読み込み失敗時は自動で文字「Promeon Web」に戻ります |
| サンプルのサムネイル（任意） | `public/assets/images/photos/` | `/samples/` とトップのサンプル | 480×300px（16:10）jpg/png | `config.js` の該当 `samples[].imageUrl` に `/assets/images/photos/ファイル名` を設定 |

- サムネイル未設定時はプラン名のプレースホルダを表示します。
- ファイル名は英数字・小文字・ハイフンのみ（例：`sample-mini.jpg`）。
- すべての `<img>` に `alt` を設定しています。同名上書きで差し替え可能です。

## デザインの方針（変更時の注意）

- **基本背景は白（`#ffffff`）**。区切りを付けたい一部のセクション（料金・制作の流れ・FAQ など）だけ、
  薄いグレー `--color-bg-alt: #f7f8fa`（`.section-alt`）または薄い暖色 `--color-bg-warm: #fff7f0`（`.section-warm`）
  を使います。すべてを機械的に交互配色にはしません。ヘッダー・カードは白。グラデーションは不使用。
  区切りは背景色だけでなく、余白・見出し下のオレンジのアクセント線・写真でも表現します。
- 写真は用途別に `.media-frame`（`object-fit: cover`／hero だけ `contain`）。1セクションにメイン画像1枚程度、
  hero は優先読み込み、それ以外は遅延読み込み、`width`/`height` 指定でレイアウトシフトを防止。
  仮画像（SVG）は壊れず「準備中」表示も出ません。
- 配色の役割：
  - **白**＝ページ／カード／ヘッダーの背景
  - **オレンジ**＝主要CTA、料金・重要な数字、「おすすめ」表示、小さなアイコン、見出しのアクセント線
  - **ネイビー**＝大見出し、ナビゲーション、本文の重要箇所、フッター、補助アクセント
  - オレンジ／ネイビーを広い面積の背景には使いません。本文は濃いネイビー寄りのダークグレー（`--color-text`）。
  - 公式LINE専用ボタンとLINEアイコンのみ LINEグリーン（`--color-line`）を使用（サイト全体には広げない）。
- ヘッダーは固定（`position: sticky; top: 0`）・白背景・薄い下境界線。高さ PC72px／SP64px、
  ページ内リンクは `scroll-padding-top` でヘッダーに隠れないようにしています。
  ナビ末尾の「お問い合わせ」（`primaryCta.headerLabel` / `primaryCta.href`）は、他のメニュー項目と
  同じ通常リンクとして表示します（ボタン化・オレンジ塗り・角丸なし）。`renderHeader()` が `nav` 配列の
  末尾に自動追加するもので、`nav` 配列やフッターには含めません。遷移先は `/contact/`。
  公式LINEはヘッダーの主要CTAにはせず、問い合わせページの「おすすめ窓口」としてのみ案内します。
- 角丸・影は控えめ（`--radius-*` と `--shadow-card` を縮小、主要カードは影なし）。
- ロゴ表記（文字）の色は既存のオレンジ系のまま。配色トークンは `src/style.css` 末尾の追記ブロックで上書き（既存行は無変更）。

## 意図的にしていること

- 架空の顧客の声・実績・住所・電話番号・地域名などは掲載していません。
- 料金は「基本プラン（標準的な内容。ページ数・機能・要望で変動）」と明記し、固定と誤解されないようにしています。
- サンプルは「架空サンプル」と明記（実在企業の実績と誤解されない表現）。
- 納期は断定しません（「通常3〜7日」等の固定表記は撤去）。「まずはご相談ください」を基本とし、
  「最短3時間」もスケジュール・制作内容により対応可否が異なる要相談の目安として案内しています。
- 支払い方法は「銀行振込」「クレジットカード」のみ。
- お問い合わせは、公式LINE・定型文入り `mailto:` リンクに加えて、`/contact/` 最下部に
  問い合わせフォーム（`#inquiry-form`）を設置しています。送信は Vercel サーバーレス関数
  `api/contact.js` が受け取り、`RESEND_API_KEY` があれば Resend、無ければ FormSubmit
  （APIキー不要）で管理者宛メールに変換します。秘密情報はすべて環境変数で管理し、
  フロントには一切含めません（下記「お問い合わせフォーム」参照）。
- 公式LINEのQRコードは `npx qrcode`（オフライン生成）で作成。外部のQR生成サービスには依存していません。
- `canonical` / `og:url` は正式ドメイン未確定のため、アクセス先URLから JavaScript で生成（架空ドメインは設定しません）。
- 各ページ個別の `title` / `meta description` / OGP を HTML に静的記述。JS無効時のフォールバックを `<noscript>` に用意。

## お問い合わせフォーム（/contact/ 最下部）

`/contact/` ページ最下部のフォーム（アンカー `#inquiry-form`）と、全ページ右下の
フローティングボタンから送信されます。

### 構成

| 役割 | 場所 |
| --- | --- |
| フォームの見た目（項目・ラベル・選択肢） | `contact/index.html` の `#inquiry-form` セクション |
| 入力チェック・送信・完了/失敗表示・二重送信防止 | `src/main.js` の `setupInquiryForm()` |
| 右下フローティングボタン（全ページ）＋初回吹き出し | `src/components.js` の `renderFloatingContact()` ／ `src/main.js` の `setupFloatingContact()` ／ 文言は `src/config.js` の `floatingContact` |
| 受信処理（サーバー側） | `api/contact.js`（Vercel サーバーレス関数） |
| スタイル | `src/style.css` 末尾の「無料相談・お問い合わせフォーム」ブロック |

### 送信方式（2通り。自動で切り替わる）

`api/contact.js` は環境変数 `RESEND_API_KEY` の有無で送信方式を切り替えます。

| 条件 | 方式 | 必要な準備 |
| --- | --- | --- |
| `RESEND_API_KEY` **なし**（既定） | **FormSubmit**（https://formsubmit.co、APIキー不要） | 初回だけ、届け先メールに届く「Activate Form」リンクを1度クリック |
| `RESEND_API_KEY` **あり** | **Resend** | Vercel に `RESEND_API_KEY` を登録 → Redeploy |

どちらの方式でも：To は `satokazu.promeon@gmail.com` 固定（`CONTACT_TO_EMAIL` で上書き可）、
件名 `【Promeon Web】新しいお問い合わせ`、Reply-To は問い合わせ者のメールアドレス。
本文：お名前／会社名・屋号／メールアドレス／お問い合わせ種別／現在サイトの有無・URL／ご予算／希望納期／お問い合わせ内容／送信日時／送信元IP。

### 送信の流れ

1. ブラウザ側で必須・メール形式・URL形式・プライバシー同意をチェック → ボタンを `disabled`（二重送信防止）＋「送信中...」
2. 問題なければ `POST /api/contact`（JSON）
3. `api/contact.js` がサーバー側でも再チェック＋スパム対策（ハニーポット `website` ／送信までの経過時間 `elapsed_ms` ／簡易レート制限 60秒3回）
4. 上表の方式でメール送信（サーバー側のみ。APIキーはブラウザに出さない）
5. **HTTP 200 かつ `success:true` のときだけ** 「お問い合わせを送信しました。」を表示。
   それ以外は「送信に失敗しました。時間をおいて再度お試しください。」

### 環境変数（すべて任意。`.env.example` 参照）

| 変数名 | 用途 |
| --- | --- |
| `RESEND_API_KEY` | 設定すると Resend 方式に切り替わる（`re_` で始まる） |
| `CONTACT_TO_EMAIL` | 届け先の変更（未設定で `satokazu.promeon@gmail.com`） |
| `CONTACT_FROM_EMAIL` | Resend 使用時の差出人（未設定で `onboarding@resend.dev`） |

- 秘密情報はコードに書かず環境変数で管理。`.env` は `.gitignore` 済みで GitHub に出ません。
- `api/` はリポジトリ直下に置くと Vercel が自動でサーバーレス関数化します（`vercel.json` 不要）。

### 動作確認

- `GET /api/contact` → `{"success":true,"method":"formsubmit" or "resend","to":"...","note":"..."}` を返す（秘密情報なし）。
- 送信失敗時、ブラウザの **開発者ツール → Console** に `[inquiry] 送信失敗: {...}`（`httpStatus`/`error`/`detail`）が出ます。
- サーバー側の詳細は Vercel の **Deployment → Functions → `api/contact` の Logs**（`[contact] ...`）。

### うまく届かないときの切り分け

| Console / Logs | 原因 | 対処 |
| --- | --- | --- |
| `error:"activation_required"` / Logs に `This form needs Activation` | FormSubmit の初回確認が未完了 | `satokazu.promeon@gmail.com` に届く FormSubmit のメールの「Activate Form」を1度クリック |
| `error:"send_failed"`, `detail.via:"formsubmit"`, Logs に `open this page through a web server` | FormSubmit に送信元サイトが伝わっていない | 実サイト（`https://...`）から送信しているか確認（ローカルの `file://` は不可） |
| `error:"send_failed"`, `detail.via:"resend"`, `detail.status:401` | Resend の API キーが誤り／失効 | キーを再発行して Vercel に登録し直す → Redeploy |
| `error:"send_failed"`, `detail.via:"resend"`, `detail.status:403` | Resend テスト差出人のまま登録アドレス以外へ送信 | Resend に `satokazu.promeon@gmail.com` で登録、または独自ドメインを認証 |
| `httpStatus 404` / `fetch 失敗` | 関数が配信されていない | Vercel の Framework Preset＝Vite、Root Directory がリポジトリ直下、`api/contact.js` が直下 `api/` にあるか確認 |
| `httpStatus 429` | 短時間に送りすぎ（60秒3回） | 少し待って再送 |
