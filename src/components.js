// ==============================================================
// Promeon Web  共通UIコンポーネント（HTML文字列を返す関数群）
// --------------------------------------------------------------
// 表示テキスト・データは ./config.js に集約しています。
// ここでは「見た目の型」だけを定義し、値は config.js から受け取ります。
// ==============================================================

import { siteConfig } from "./config.js";

/** HTMLエスケープ */
export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 数値を「49,800円」のような表示に変換 */
export function formatPrice(price) {
  return `${Number(price).toLocaleString("ja-JP")}円`;
}

/**
 * 現在のパスとナビ項目の href を突き合わせて「現在地」を判定する。
 *  - "#" を含むリンク（トップ内セクション）は現在地扱いしない
 *  - "/" は完全一致、それ以外は前方一致
 */
function isCurrent(href, path) {
  if (href.includes("#")) return false;
  if (href === "/") return path === "/" || path === "/index.html";
  return path === href || path.startsWith(href);
}

/** 外部リンク（http〜）なら新しいタブ＋rel を付与するための属性文字列 */
function externalAttrs(href) {
  return /^https?:\/\//.test(href)
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
}

/** 共通ヘッダー（固定・ハンバーガー対応）＋ スマホ用固定CTA */
export function renderHeader(currentPath = "/") {
  const { siteName, nav, primaryCta, stickyCta, contact, logoImage } = siteConfig;

  // ナビ項目の末尾に「お問い合わせ」を追加。
  //   他のメニュー（サービス・料金…）と同じ通常リンクとして表示します（ボタン化しない）。
  //   遷移先は主要CTAと同じ（primaryCta.href）。フッターには出しません（nav 配列は変更しない）。
  const navItems = [
    ...nav,
    { label: primaryCta.headerLabel || "お問い合わせ", href: primaryCta.href },
  ];

  const links = navItems
    .map((item) => {
      const current = isCurrent(item.href, currentPath);
      return `<a href="${esc(item.href)}"${
        current ? ' aria-current="page"' : ""
      }>${esc(item.label)}</a>`;
    })
    .join("");

  // ロゴ：画像があれば <img>、無ければ／読み込み失敗時は文字「Promeon Web」
  const logoInner = logoImage
    ? `<img class="site-logo-img" src="${esc(
        logoImage
      )}" alt="${esc(siteName)}" width="190" height="40" />
       <span class="site-logo-text" data-site-name hidden>${esc(siteName)}</span>`
    : `<span class="site-logo-text" data-site-name>${esc(siteName)}</span>`;

  const sticky = (stickyCta || [])
    .map((c) => {
      const href = c.key === "line" ? contact.line || "" : c.href || "";
      if (!href) return "";
      const cls =
        c.style === "line"
          ? "btn-line"
          : c.style === "outline"
          ? "btn-outline"
          : "btn-primary";
      return `<a href="${esc(href)}" class="btn ${cls}"${externalAttrs(
        href
      )}>${esc(c.label)}</a>`;
    })
    .join("");

  return `
  <a class="skip-link" href="#main">本文へスキップ</a>
  <header class="site-header">
    <div class="container">
      <a href="/" class="site-logo" aria-label="${esc(siteName)}（トップページへ）">
        ${logoInner}
      </a>

      <button
        id="nav-toggle"
        class="nav-toggle"
        type="button"
        aria-label="メニューを開く"
        aria-expanded="false"
        aria-controls="site-nav"
      >
        <span></span><span></span><span></span>
      </button>

      <nav id="site-nav" class="site-nav" aria-label="サイト内メニュー">
        ${links}
      </nav>
    </div>
  </header>

  <div class="sticky-cta" aria-label="相談へのショートカット">
    ${sticky}
  </div>`;
}

/**
 * 用途別の画像フレーム。
 *  - 仮画像(SVG)でも本番画像(WebP)でも、同じ src で表示できます。
 *  - width / height を必ず指定してレイアウトシフトを防ぎます。
 *  - hero 以外は遅延読み込み（eager=true で優先読み込み）。
 */
export function mediaFrame(src, alt, w, h, { eager = false, fit = "cover", className = "" } = {}) {
  const loadAttrs = eager
    ? 'fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  return `
  <figure class="media-frame ${fit === "contain" ? "media-frame--contain" : ""} ${esc(
    className
  )}" style="aspect-ratio:${w}/${h}">
    <img class="media-img" src="${esc(src)}" alt="${esc(alt)}" width="${w}" height="${h}" ${loadAttrs} />
  </figure>`;
}

/**
 * 共通フッター（情報整理型・3カラム＋下段）。
 *  - 左：サービス・お問い合わせ ／ 中央：Promeon Webについて ／ 右：法的情報
 *  - 下段：ブランドロゴ（画像）＋ 著作権表記
 *  - リンク先はすべて config.js（nav / primaryCta / contact.line）と実在ページに準拠。
 */
export function renderFooter() {
  const { contact, primaryCta, nav } = siteConfig;
  const contactHref = (primaryCta && primaryCta.href) || "/contact/";
  const lineUrl = (contact && contact.line) || "";

  const serviceLinks = [
    `<li><a href="${esc(contactHref)}">無料相談</a></li>`,
    `<li><a href="${esc(contactHref)}">無料見積り</a></li>`,
    lineUrl
      ? `<li><a href="${esc(
          lineUrl
        )}" target="_blank" rel="noopener noreferrer">公式LINE</a></li>`
      : "",
    `<li><a href="${esc(contactHref)}">お問い合わせ</a></li>`,
  ].join("");

  const aboutLinks = (nav || [])
    .map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`)
    .join("");

  const legalLinks = [
    ["/privacy.html", "プライバシーポリシー"],
    ["/terms/", "サービス利用規約"],
    ["/tokushoho/", "特定商取引法に基づく表記"],
    ["/order-terms/", "Webサイト制作申込規約"],
  ]
    .map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`)
    .join("");

  return `
  <footer class="site-footer">
    <div class="container footer-cols">
      <nav class="footer-col" aria-label="サービス・お問い合わせ">
        <p class="footer-col-title">サービス・お問い合わせ</p>
        <ul class="footer-col-links">${serviceLinks}</ul>
      </nav>
      <nav class="footer-col" aria-label="Promeon Webについて">
        <p class="footer-col-title">Promeon Webについて</p>
        <ul class="footer-col-links">${aboutLinks}</ul>
      </nav>
      <nav class="footer-col footer-col--legal" aria-label="法的情報">
        <p class="footer-col-title">法的情報</p>
        <ul class="footer-col-links">${legalLinks}</ul>
      </nav>
    </div>

    <div class="container footer-bottom">
      <a href="/" class="footer-brand" aria-label="Promeon Web トップページへ">
        <img
          class="site-logo-img footer-logo-img"
          src="/assets/images/logo/promeon-logo.svg"
          alt="Promeon Web"
          width="180"
          height="81"
        />
        <span class="site-logo-text footer-logo-text" data-site-name hidden>Promeon Web</span>
      </a>
      <p class="footer-copy">&copy; 2026 Promeon Web. All Rights Reserved.</p>
    </div>
  </footer>`;
}

/**
 * 全ページ右下の常時表示フローティング問い合わせボタン（＋初回のみの吹き出し）。
 *  - リンク先は無料相談ページの問い合わせフォーム（#inquiry-form）。
 *  - PC / スマホでラベルを出し分け（表示切替は CSS）。
 *  - 吹き出しの表示制御は main.js（初回のみ・スマホ非表示）。
 */
export function renderFloatingContact() {
  const fc = siteConfig.floatingContact;
  if (!fc || !fc.href) return "";

  const bubble = fc.bubble
    ? `<p class="floating-contact__bubble" data-floating-bubble hidden>${esc(fc.bubble)}</p>`
    : "";

  return `
  <div class="floating-contact" data-floating-contact>
    ${bubble}
    <a
      class="floating-contact__btn"
      href="${esc(fc.href)}"
      aria-label="${esc(fc.ariaLabel || fc.labelPc || "お問い合わせ")}"
    >
      ${fc.icon ? `<span class="floating-contact__icon" aria-hidden="true">${esc(fc.icon)}</span>` : ""}
      <span class="floating-contact__label floating-contact__label--pc">${esc(
        fc.labelPc || "無料相談・お問い合わせ"
      )}</span>
      <span class="floating-contact__label floating-contact__label--sp">${esc(
        fc.labelSp || "無料相談"
      )}</span>
    </a>
  </div>`;
}

/** セクション見出し（EYEBROW＋見出し＋任意のリード文） */
export function sectionHeading(eyebrow, title, lead = "", level = 2) {
  const h = level === 1 ? "h1" : "h2";
  return `
  <div class="section-head">
    ${eyebrow ? `<span class="section-eyebrow">${esc(eyebrow)}</span>` : ""}
    <${h}>${esc(title)}</${h}>
    ${lead ? `<p>${esc(lead)}</p>` : ""}
  </div>`;
}

/** 料金プランカード（detailed=true で用途・修正回数・納期まで表示） */
export function planCard(plan, { detailed = false } = {}) {
  const { primaryCta } = siteConfig;
  const included = plan.included.map((f) => `<li>${esc(f)}</li>`).join("");

  const detailRows = detailed
    ? `
    <dl class="plan-detail">
      <div><dt>ページ数</dt><dd>${esc(plan.pages)}</dd></div>
      <div><dt>セクション数</dt><dd>${esc(plan.sections)}</dd></div>
      <div><dt>想定用途</dt><dd>${esc(plan.useCase)}</dd></div>
      <div><dt>修正回数</dt><dd>${esc(plan.revisions)}</dd></div>
      <div><dt>納期の目安</dt><dd>${esc(plan.delivery)}</dd></div>
      <div><dt>納品形式</dt><dd>${esc(plan.deliveryFormat)}</dd></div>
    </dl>`
    : `<p class="plan-structure">${esc(plan.pages)}・${esc(plan.sections)}</p>`;

  const sampleLink = detailed
    ? `<a class="plan-sample-link" href="/samples/#sample-${esc(
        plan.id
      )}">${esc(plan.name)}の制作サンプルを見る</a>`
    : "";

  return `
  <li class="plan-card ${plan.recommended ? "is-recommended" : ""}" id="plan-${esc(
    plan.id
  )}">
    ${plan.recommended ? '<span class="plan-badge">おすすめ</span>' : ""}
    <h3 class="plan-name">${esc(plan.name)}</h3>
    <p class="plan-summary">${esc(plan.summary)}</p>
    <p class="plan-price">${formatPrice(plan.price)}<span class="plan-price-tax">（税込）から</span></p>
    ${detailRows}
    <p class="plan-features-label">基本料金に含まれる内容</p>
    <ul class="plan-features">${included}</ul>
    ${plan.note ? `<p class="plan-note">${esc(plan.note)}</p>` : ""}
    ${sampleLink}
    <a href="${esc(primaryCta.href)}?plan=${esc(plan.id)}" class="btn ${
    plan.recommended ? "btn-primary" : "btn-outline"
  } plan-cta">このプランで相談する</a>
  </li>`;
}

/** プラン比較表（横スクロール可能なラッパーつき） */
export function planComparisonTable() {
  const { planComparison } = siteConfig;
  if (!planComparison) return "";

  const head = planComparison.columns
    .map(
      (c) =>
        `<th scope="col">${esc(c)}${
          c === "Standard" ? ' <span class="th-badge">おすすめ</span>' : ""
        }</th>`
    )
    .join("");

  const body = planComparison.rows
    .map((row) => {
      const cells = row.values
        .map((v) => {
          const isCheck = v === "○";
          return `<td${isCheck ? ' class="cell-check"' : ""}>${
            isCheck
              ? '<span aria-hidden="true">○</span><span class="sr-only">対応</span>'
              : esc(v)
          }</td>`;
        })
        .join("");
      return `<tr><th scope="row">${esc(row.label)}</th>${cells}</tr>`;
    })
    .join("");

  return `
  <div class="table-scroll" role="region" aria-label="プラン比較表" tabindex="0">
    <table class="compare-table">
      <thead><tr><th scope="col">項目</th>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div>`;
}

/** 「基本プランについて」の案内 */
export function basicPlanNote() {
  const n = siteConfig.basicPlanNote;
  if (!n) return "";
  return `
  <div class="basic-plan-note">
    <h2>${esc(n.heading)}</h2>
    <p>${esc(n.body)}</p>
  </div>`;
}

/** 「完全オーダーメイド制作」の案内（プラン比較の下に独立表示） */
export function customPlanBlock() {
  const c = siteConfig.customPlan;
  const { primaryCta } = siteConfig;
  if (!c) return "";
  return `
  <div class="custom-plan">
    <div class="custom-plan-body">
      <h2>${esc(c.heading)}</h2>
      <p>${esc(c.body)}</p>
      <p class="custom-plan-note">${esc(c.note)}</p>
    </div>
    <div class="custom-plan-side">
      <p class="custom-plan-price">${esc(c.price)}</p>
      <a href="${esc(primaryCta.href)}?plan=custom" class="btn btn-primary">${esc(
    primaryCta.label
  )}</a>
    </div>
  </div>`;
}

/** 「有料オプションの例」（料金プラン全体に共通） */
export function paidOptionsBlock() {
  const o = siteConfig.paidOptions;
  if (!o) return "";
  return `
  <div class="paid-options">
    <h2>${esc(o.heading)}</h2>
    <ul class="paid-options-list">
      ${o.items.map((i) => `<li>${esc(i)}</li>`).join("")}
    </ul>
    <p class="paid-options-note">${esc(o.note)}</p>
  </div>`;
}

/** 制作サンプルカード（detailed=true でページ構成・機能・向いている事業者まで表示） */
export function sampleCard(sample, { detailed = false } = {}) {
  const isPublished =
    sample.status === "published" && Boolean(sample.demoUrl);
  const hasImage = Boolean(sample.imageUrl);
  const statusLabel = isPublished ? "公開中" : "準備中";
  const statusClass = isPublished ? "is-published" : "is-preparing";
  const anchorId = `sample-${esc((sample.plan || "").toLowerCase())}`;

  const openButton = isPublished
    ? `<a class="btn sample-link sample-link--open" href="${esc(
        sample.demoUrl
      )}" target="_blank" rel="noopener noreferrer" aria-label="${esc(
        sample.plan
      )}プランのサンプルサイトを見る（別タブで開きます）">サンプルを見る <span aria-hidden="true">↗</span></a>`
    : `<span class="btn sample-link is-disabled" aria-disabled="true">準備中</span>`;

  const planButton = `<a class="btn btn-outline sample-plan-link" href="/plans/#plan-${esc(
    (sample.plan || "").toLowerCase()
  )}">プラン詳細を見る</a>`;

  const functionsList = Array.isArray(sample.functions)
    ? `<ul class="sample-functions">${sample.functions
        .map((f) => `<li>${esc(f)}</li>`)
        .join("")}</ul>`
    : "";

  const detailRows = detailed
    ? `
    <dl class="sample-detail">
      <div><dt>プラン</dt><dd>${esc(sample.plan)}</dd></div>
      <div><dt>想定業種</dt><dd>${esc(sample.industry)}</dd></div>
      <div><dt>ページ構成</dt><dd>${esc(sample.pages)}</dd></div>
      <div><dt>向いている事業者</dt><dd>${esc(sample.bestFor)}</dd></div>
    </dl>
    <p class="sample-functions-label">含まれる主な機能</p>
    ${functionsList}`
    : `<p class="sample-category">業種：${esc(sample.industry)}</p>
       <p class="sample-desc">${esc(sample.desc)}</p>`;

  // サムネイル（サンプル画面）は詳細カード（/samples/）でのみ表示し、重複掲載を避ける
  const thumb =
    detailed && hasImage
      ? `<div class="sample-thumb">
      <img class="media-img" src="${esc(sample.imageUrl)}" alt="${esc(
          sample.industry
        )}の制作サンプル画面（${esc(sample.plan)}プラン）" width="640" height="400" loading="lazy" decoding="async">
    </div>`
      : "";

  return `
  <li class="card sample-card" id="${anchorId}">
    <div class="sample-plan-head">
      <h3 class="sample-plan">${esc(sample.plan)}</h3>
      <span class="sample-status ${statusClass}">${statusLabel}</span>
    </div>
    ${thumb}
    ${
      sample.isFictional
        ? `<p class="sample-fictional">サービス紹介用の架空サンプルです</p>`
        : ""
    }
    ${detailRows}
    <div class="sample-actions">
      ${openButton}
      ${planButton}
    </div>
  </li>`;
}

/** よくある質問 1件（<dl> の中に置く。回答は最初から表示・開閉なし） */
export function faqItem(item) {
  return `
  <div class="faq-item">
    <dt class="faq-q">${esc(item.q)}</dt>
    <dd class="faq-a">${esc(item.a)}</dd>
  </div>`;
}
