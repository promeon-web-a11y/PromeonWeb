// ==============================================================
// Promeon Web サイト用スクリプト
// --------------------------------------------------------------
// 表示内容（料金・SNSリンク・サービス内容・制作サンプルなど）は
// すべて ./config.js から読み込んでいます。
// 表示テキストを変更したい場合は、このファイルではなく
// src/config.js を編集してください。
// ==============================================================

import { siteConfig } from "./config.js";

/** 改行込みテキストを安全に <br> 付きで挿入するためのユーティリティ */
function setTextWithLineBreaks(el, text) {
  if (!el) return;
  el.textContent = ""; // 一旦クリア
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    el.appendChild(document.createTextNode(line));
    if (i < lines.length - 1) el.appendChild(document.createElement("br"));
  });
}

/** 数値を「49,800円」のような表示に変換 */
function formatPrice(price) {
  return `${price.toLocaleString("ja-JP")}円`;
}

/**
 * 連絡先リンクの反映
 * data-contact="line|instagram|x|facebook|email" を持つ要素の href を
 * config.js の値に差し替える。値が未設定（空文字）の場合は「準備中」表示にし
 * クリックできない状態にする。
 * data-contact-text="xxx" を持つ要素にはテキストとして値（未設定なら「準備中」）を挿入する。
 */
function renderContactLinks() {
  const { contact } = siteConfig;

  Object.keys(contact).forEach((key) => {
    const value = contact[key];

    // リンク要素（<a data-contact="line">）
    document.querySelectorAll(`[data-contact="${key}"]`).forEach((el) => {
      if (value) {
        el.href = key === "email" ? `mailto:${value}` : value;
        el.classList.remove("is-disabled");
        el.removeAttribute("aria-disabled");
      } else {
        el.href = "#";
        el.classList.add("is-disabled");
        el.setAttribute("aria-disabled", "true");
        el.addEventListener("click", (e) => e.preventDefault());
      }
    });

    // テキスト表示用要素（<span data-contact-text="email">）
    document.querySelectorAll(`[data-contact-text="${key}"]`).forEach((el) => {
      el.textContent = value || "準備中";
    });
  });
}

/** ファーストビューのキャッチコピー */
function renderHero() {
  setTextWithLineBreaks(document.getElementById("hero-heading"), siteConfig.catchCopy);
  setTextWithLineBreaks(document.getElementById("hero-subcopy"), siteConfig.subCopy);
}

/** よくある悩み */
function renderPainPoints() {
  const list = document.getElementById("pain-list");
  if (!list) return;
  list.innerHTML = siteConfig.painPoints
    .map((text) => `<li class="pain-item">${text}</li>`)
    .join("");
}

/** サービス紹介 */
function renderServices() {
  const grid = document.getElementById("services-grid");
  if (!grid) return;
  grid.innerHTML = siteConfig.services
    .map(
      (s) => `
      <li class="card service-card">
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </li>`
    )
    .join("");
}

/** 選ばれる理由 */
function renderStrengths() {
  const grid = document.getElementById("strengths-grid");
  if (!grid) return;
  grid.innerHTML = siteConfig.strengths
    .map(
      (s, i) => `
      <li class="strength-card">
        <span class="strength-num">${i + 1}</span>
        <div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>
      </li>`
    )
    .join("");
}

/** 料金プラン */
function renderPricing() {
  const grid = document.getElementById("pricing-grid");
  if (!grid) return;
  grid.innerHTML = siteConfig.pricingPlans
    .map(
      (plan) => `
      <li class="plan-card ${plan.recommended ? "is-recommended" : ""}">
        ${plan.recommended ? '<span class="plan-badge">おすすめ</span>' : ""}
        <h3 class="plan-name">${plan.name}</h3>
        <p class="plan-summary">${plan.summary}</p>
        <p class="plan-price">${formatPrice(plan.price)}<span class="plan-price-tax">（税込）</span></p>
        <ul class="plan-features">
          ${plan.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>
        <a href="#contact" class="btn ${plan.recommended ? "btn-primary" : "btn-outline"} plan-cta">
          このプランで相談する
        </a>
      </li>`
    )
    .join("");

  const paymentEl = document.getElementById("payment-methods");
  if (paymentEl) {
    paymentEl.textContent = siteConfig.paymentMethods.join(" / ");
  }
}

/** 制作の流れ */
function renderFlow() {
  const list = document.getElementById("flow-list");
  if (!list) return;
  list.innerHTML = siteConfig.flowSteps
    .map(
      (step, i) => `
      <li class="flow-step">
        <span class="flow-num">${i + 1}</span>
        <div>
          <h3>${step.title}</h3>
          <p>${step.desc}</p>
        </div>
      </li>`
    )
    .join("");
}

/** 制作サンプル（プランごとのデモサイト） */
function renderSamples() {
  const grid = document.getElementById("samples-grid");
  if (!grid) return;
  grid.innerHTML = siteConfig.samples
    .map((sample) => {
      // "published" かつ demoUrl がある場合のみ「公開中」。それ以外は「準備中」。
      const isPublished = sample.status === "published" && Boolean(sample.demoUrl);
      const hasImage = Boolean(sample.imageUrl);
      const statusLabel = isPublished ? "公開中" : "準備中";
      const statusClass = isPublished ? "is-published" : "is-preparing";
      const button = isPublished
        ? `<a class="btn sample-link sample-link--open" href="${sample.demoUrl}" target="_blank" rel="noopener noreferrer" aria-label="${sample.plan}プランのサンプルサイトを見る（別タブで開きます）">サンプルサイトを見る <span aria-hidden="true">↗</span></a>`
        : `<span class="btn sample-link is-disabled" aria-disabled="true">準備中</span>`;
      return `
      <li class="card sample-card">
        <div class="sample-plan-head">
          <h3 class="sample-plan">${sample.plan}</h3>
          <span class="sample-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="sample-thumb" role="img" aria-label="${sample.industry}のサンプルイメージ">
          ${
            hasImage
              ? `<img src="${sample.imageUrl}" alt="${sample.title}" loading="lazy">`
              : `<span class="sample-thumb-placeholder">${sample.plan}</span>`
          }
        </div>
        <p class="sample-category">業種：${sample.industry}</p>
        <p class="sample-desc">${sample.desc}</p>
        ${button}
      </li>`;
    })
    .join("");
}

/** ヒアリングシートの案内（URL未設定なら「準備中」表示、設定済みならリンク表示） */
function renderHearingSheet() {
  const el = document.getElementById("hearing-sheet-link");
  if (!el) return;
  const url = siteConfig.hearingSheetUrl;
  if (url) {
    el.innerHTML = ` <a class="hearing-sheet-anchor" href="${url}" target="_blank" rel="noopener noreferrer">ヒアリングシートを開く <span aria-hidden="true">↗</span></a>`;
  } else {
    el.textContent = "（ヒアリングシートはお申し込み後にご案内します）";
  }
}

/** FAQ */
function renderFaq() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = siteConfig.faqs
    .map(
      (item) => `
      <details class="faq-item">
        <summary>${item.q}</summary>
        <p>${item.a}</p>
      </details>`
    )
    .join("");
}

/** サイト名・タグライン・コピーライトなど共通テキスト */
function renderCommonText() {
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.textContent = siteConfig.siteName;
  });
  document.querySelectorAll("[data-site-tagline]").forEach((el) => {
    el.textContent = siteConfig.tagline;
  });
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

/** スマホ用ナビゲーションの開閉 */
function setupMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // メニュー内のリンクをクリックしたら閉じる（アンカー遷移時の使い勝手向上）
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function init() {
  renderCommonText();
  renderContactLinks();
  renderHero();
  renderPainPoints();
  renderServices();
  renderStrengths();
  renderPricing();
  renderFlow();
  renderHearingSheet();
  renderSamples();
  renderFaq();
  setupMobileNav();
}

document.addEventListener("DOMContentLoaded", init);
