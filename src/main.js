// ==============================================================
// Promeon Web  サイト共通スクリプト
// --------------------------------------------------------------
// 表示内容はすべて ./config.js から読み込みます。
// 文言・数値を変えたいときは、このファイルではなく src/config.js を編集してください。
// ==============================================================

import { siteConfig } from "./config.js";
import {
  esc,
  renderHeader,
  renderFooter,
  renderFloatingContact,
  sectionHeading,
  mediaFrame,
  planCard,
  planComparisonTable,
  basicPlanNote,
  customPlanBlock,
  paidOptionsBlock,
  sampleCard,
  faqItem,
} from "./components.js";

/* -------------------------------------------------------------
 * ユーティリティ
 * ----------------------------------------------------------- */

function setTextWithLineBreaks(el, text) {
  if (!el) return;
  el.textContent = "";
  text.split("\n").forEach((line, i, arr) => {
    el.appendChild(document.createTextNode(line));
    if (i < arr.length - 1) el.appendChild(document.createElement("br"));
  });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* -------------------------------------------------------------
 * 共通：ヘッダー / フッター / 基本テキスト / canonical
 * ----------------------------------------------------------- */

function mountChrome() {
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");
  if (headerMount) headerMount.outerHTML = renderHeader(window.location.pathname);
  if (footerMount) footerMount.outerHTML = renderFooter();

  // 全ページ右下の常時表示フローティング問い合わせボタン
  if (!document.querySelector("[data-floating-contact]")) {
    document.body.insertAdjacentHTML("beforeend", renderFloatingContact());
  }
}

/** ロゴ画像が読み込めない場合だけ文字「Promeon Web」を表示（ヘッダー・フッター両方） */
function setupLogoFallback() {
  document.querySelectorAll(".site-logo-img").forEach((img) => {
    const text =
      img.parentElement && img.parentElement.querySelector(".site-logo-text");
    if (!text) return;
    const toText = () => {
      img.hidden = true;
      text.hidden = false;
    };
    img.addEventListener("error", toText);
    if (img.complete && img.naturalWidth === 0) toText();
  });
}

function renderCommonText() {
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.textContent = siteConfig.siteName;
  });
  document.querySelectorAll("[data-site-tagline]").forEach((el) => {
    el.textContent = siteConfig.tagline;
  });
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll("[data-cta-note]").forEach((el) => {
    el.textContent = siteConfig.ctaSupportNote;
  });
}

/**
 * 連絡先リンクの反映。
 *  - email：空なら「準備中」表示・クリック不可
 *  - line / instagram / facebook：値があれば新しいタブ＋rel、無ければ要素ごと非表示
 */
function renderContactLinks() {
  const { contact } = siteConfig;

  Object.keys(contact).forEach((key) => {
    const value = contact[key];

    document.querySelectorAll(`[data-contact="${key}"]`).forEach((el) => {
      if (value) {
        el.href = key === "email" ? `mailto:${value}` : value;
        el.classList.remove("is-disabled");
        el.removeAttribute("aria-disabled");
        if (key !== "email") {
          el.target = "_blank";
          el.rel = "noopener noreferrer";
        }
      } else if (key === "email") {
        el.href = "#";
        el.classList.add("is-disabled");
        el.setAttribute("aria-disabled", "true");
        el.addEventListener("click", (e) => e.preventDefault());
      } else {
        const wrapper = el.closest("[data-contact-optional]") || el;
        wrapper.hidden = true;
      }
    });

    document.querySelectorAll(`[data-contact-text="${key}"]`).forEach((el) => {
      el.textContent = value || "準備中";
    });
  });

  // 公式LINEのQRコード画像
  document.querySelectorAll("[data-line-qr]").forEach((img) => {
    if (siteConfig.contact.line && siteConfig.lineQrImage) {
      img.src = siteConfig.lineQrImage;
    } else {
      const wrap = img.closest("[data-contact-optional]") || img;
      wrap.hidden = true;
    }
  });
}

/**
 * [data-media="key|w|h|fit|eager"] のプレースホルダを画像フレームに置換。
 * key は siteConfig.images のキー。
 */
function renderMedia() {
  document.querySelectorAll("[data-media]").forEach((el) => {
    const [key, w = "1200", h = "800", fit = "cover", eager = ""] = el
      .getAttribute("data-media")
      .split("|");
    const src = siteConfig.images && siteConfig.images[key];
    if (!src) {
      el.hidden = true;
      return;
    }
    el.innerHTML = mediaFrame(src, el.getAttribute("data-media-alt") || "", Number(w), Number(h), {
      eager: eager === "eager",
      fit,
    });
  });
}

/** 画像が読み込めなかった場合は枠を空表示にする（壊れた画像アイコンを出さない） */
function setupMedia() {
  document.querySelectorAll(".media-img").forEach((img) => {
    img.addEventListener("error", () => {
      const frame = img.closest(".media-frame") || img.parentElement;
      if (frame) frame.classList.add("is-empty");
      img.remove();
    });
  });
}

/** 問い合わせページの SNS 案内（Facebook / Instagram / X） */
function renderContactSns() {
  const wrap = document.getElementById("contact-sns");
  if (!wrap) return;
  const { contact, contactSns } = siteConfig;

  wrap.innerHTML = (contactSns || [])
    .map((s) => {
      if (s.key === "facebook") {
        const url = contact.facebook || "";
        if (url) {
          return `<div class="sns-item">
            <span class="sns-name">${esc(s.label)}</span>
            <a class="btn btn-outline sns-btn" href="${esc(
              url
            )}" target="_blank" rel="noopener noreferrer">Facebookを見る</a>
          </div>`;
        }
        return `<div class="sns-item sns-item--soon">
          <span class="sns-name">${esc(s.label)}</span>
          <span class="sns-soon" aria-disabled="true">近日公開予定</span>
        </div>`;
      }
      return `<div class="sns-item sns-item--soon">
        <span class="sns-name">${esc(s.label)}</span>
        <span class="sns-soon" aria-disabled="true">近日公開予定</span>
      </div>`;
    })
    .join("");
}

/** canonical / og:url を実際のアクセス先URLから設定（架空ドメインは使わない） */
function setCanonical() {
  let path = window.location.pathname.replace(/index\.html$/, "");
  if (!path.endsWith("/") && !path.includes(".")) path += "/";
  const url = window.location.origin + path;

  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = url;

  const og = document.querySelector('meta[property="og:url"]');
  if (og) og.setAttribute("content", url);
}

/** [data-section-head]="eyebrow|title|lead"（data-h1 併記で <h1>） */
function renderSectionHeads() {
  document.querySelectorAll("[data-section-head]").forEach((el) => {
    const [eyebrow = "", title = "", lead = ""] = el
      .getAttribute("data-section-head")
      .split("|");
    const level = el.hasAttribute("data-h1") ? 1 : 2;
    el.innerHTML = sectionHeading(eyebrow, title, lead, level);
  });
}

/* -------------------------------------------------------------
 * トップページ
 * ----------------------------------------------------------- */

function renderHome() {
  const hero = document.getElementById("hero-heading");
  if (!hero) return;

  setTextWithLineBreaks(hero, siteConfig.catchCopy);
  setTextWithLineBreaks(document.getElementById("hero-subcopy"), siteConfig.subCopy);

  const badges = document.getElementById("hero-badges");
  if (badges) {
    badges.innerHTML = siteConfig.heroBadges
      .map((b) => `<li>${esc(b)}</li>`)
      .join("");
  }

  const caption = document.getElementById("hero-caption");
  if (caption) caption.textContent = siteConfig.heroCaption;

  const pains = document.getElementById("home-pains");
  if (pains) {
    pains.innerHTML = siteConfig.painPoints
      .map((p) => `<li class="pain-item">${esc(p)}</li>`)
      .join("");
  }
  const painSolution = document.getElementById("home-pain-solution");
  if (painSolution) painSolution.textContent = siteConfig.painSolution;

  const reasons = document.getElementById("home-reasons");
  if (reasons) {
    reasons.innerHTML = siteConfig.reasons
      .map(
        (r, i) => `
        <li class="reason-card">
          <span class="reason-num">${i + 1}</span>
          <h3>${esc(r.title)}</h3>
          <p>${esc(r.desc)}</p>
        </li>`
      )
      .join("");
  }

  const samples = document.getElementById("home-samples");
  if (samples) {
    samples.innerHTML = siteConfig.samples
      .map((s) => sampleCard(s, { detailed: false }))
      .join("");
  }

  const plans = document.getElementById("home-plans");
  if (plans) {
    plans.innerHTML = siteConfig.pricingPlans
      .map((p) => planCard(p, { detailed: false }))
      .join("");
  }

  const ai = document.getElementById("home-ai");
  if (ai) {
    const { aiProcess } = siteConfig;
    ai.innerHTML = `
      <ol class="ai-steps">
        ${aiProcess.steps
          .map(
            (s, i) =>
              `<li class="ai-step"><span class="ai-step-num">${i + 1}</span><span>${esc(
                s
              )}</span></li>`
          )
          .join("")}
      </ol>
      <div class="ai-tools">
        <p class="ai-tools-label">活用しているAI</p>
        <ul>${aiProcess.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <p class="ai-reason">${esc(aiProcess.reason)}</p>`;
  }

  const flow = document.getElementById("home-flow");
  if (flow) {
    flow.innerHTML = siteConfig.flowSteps
      .map(
        (step, i) => `
        <li class="flow-step flow-step--compact">
          <span class="flow-num">${i + 1}</span>
          <div><h3>${esc(step.title)}</h3></div>
        </li>`
      )
      .join("");
  }

  const faq = document.getElementById("home-faq");
  if (faq) {
    faq.innerHTML = siteConfig.faqs.slice(0, 5).map(faqItem).join("");
  }
}

/* -------------------------------------------------------------
 * 料金・プランページ
 * ----------------------------------------------------------- */

function renderPlansPage() {
  const grid = document.getElementById("plans-grid");
  if (!grid) return;

  const basic = document.getElementById("plans-basic-note");
  if (basic) basic.innerHTML = basicPlanNote();

  grid.innerHTML = siteConfig.pricingPlans
    .map((p) => planCard(p, { detailed: true }))
    .join("");

  const table = document.getElementById("plans-compare");
  if (table) table.innerHTML = planComparisonTable();

  const custom = document.getElementById("plans-custom");
  if (custom) custom.innerHTML = customPlanBlock();

  const options = document.getElementById("plans-paid-options");
  if (options) options.innerHTML = paidOptionsBlock();

  const notes = document.getElementById("plans-notes");
  if (notes) {
    notes.innerHTML = siteConfig.pricingNotes
      .map((n) => `<li>${esc(n)}</li>`)
      .join("");
  }

  const payment = document.getElementById("payment-methods");
  if (payment) payment.textContent = siteConfig.paymentMethods.join(" / ");
}

/* -------------------------------------------------------------
 * 制作サンプルページ
 * ----------------------------------------------------------- */

function renderSamplesPage() {
  const grid = document.getElementById("samples-grid");
  if (!grid) return;
  grid.innerHTML = siteConfig.samples
    .map((s) => sampleCard(s, { detailed: true }))
    .join("");
}

/* -------------------------------------------------------------
 * 制作の流れページ
 * ----------------------------------------------------------- */

function renderFlowPage() {
  const list = document.getElementById("flow-list");
  if (list) {
    list.innerHTML = siteConfig.flowSteps
      .map(
        (step, i) => `
        <li class="flow-step">
          <span class="flow-num">${i + 1}</span>
          <div class="flow-body">
            <h3>${esc(step.title)}</h3>
            <div class="flow-two-col">
              <div class="flow-col flow-col--you">
                <span class="flow-col-label">お客様が行うこと</span>
                <p>${esc(step.you)}</p>
              </div>
              <div class="flow-col flow-col--us">
                <span class="flow-col-label">Promeon Webが行うこと</span>
                <p>${esc(step.us)}</p>
              </div>
            </div>
            ${
              step.check
                ? `<p class="flow-check"><span aria-hidden="true">✔</span> 確認のタイミング：${esc(
                    step.check
                  )}</p>`
                : ""
            }
          </div>
        </li>`
      )
      .join("");
  }

  const mats = document.getElementById("flow-materials");
  if (mats) {
    mats.innerHTML = siteConfig.flowDetails.materials
      .map((m) => `<li>${esc(m)}</li>`)
      .join("");
  }
  const matsNote = document.getElementById("flow-materials-note");
  if (matsNote) matsNote.textContent = siteConfig.flowDetails.materialsNote;
  const revNote = document.getElementById("flow-revisions-note");
  if (revNote) revNote.textContent = siteConfig.flowDetails.revisionsNote;
  const delNote = document.getElementById("flow-delivery-note");
  if (delNote) delNote.textContent = siteConfig.flowDetails.deliveryNote;

  const cond = document.getElementById("flow-fast-conditions");
  if (cond) {
    cond.innerHTML = siteConfig.fastDeliveryConditions
      .map((c) => `<li>${esc(c)}</li>`)
      .join("");
  }

  renderHearingSheet();
}

function renderHearingSheet() {
  const el = document.getElementById("hearing-sheet-link");
  if (!el) return;
  const url = siteConfig.hearingSheetUrl;
  if (url) {
    el.innerHTML = ` <a class="hearing-sheet-anchor" href="${esc(
      url
    )}" target="_blank" rel="noopener noreferrer">ヒアリングシートを開く <span aria-hidden="true">↗</span></a>`;
  } else {
    el.textContent = "（ヒアリングシートはお申し込み後にご案内します）";
  }
}

/* -------------------------------------------------------------
 * よくある質問ページ
 * ----------------------------------------------------------- */

function renderFaqPage() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = siteConfig.faqs.map(faqItem).join("");
}

/* -------------------------------------------------------------
 * お問い合わせページ
 * ----------------------------------------------------------- */

function renderContactPage() {
  const notes = document.getElementById("contact-notes");
  if (!notes) return;

  const guide = siteConfig.contactGuide;
  notes.innerHTML = guide.notes.map((n) => `<li>${esc(n)}</li>`).join("");

  const checklist = document.getElementById("contact-checklist");
  if (checklist) {
    checklist.innerHTML = guide.checklist
      .map((c) => `<li>${esc(c)}</li>`)
      .join("");
  }

  const email = siteConfig.contact.email;
  const planParam = getQueryParam("plan");
  const bodyLines = guide.mailBody.slice();
  if (planParam) {
    const map = {
      mini: "Mini",
      standard: "Standard",
      pro: "Pro",
      custom: "完全オーダーメイド",
    };
    const label = map[planParam.toLowerCase()];
    if (label) {
      const idx = bodyLines.findIndex((l) => l.startsWith("制作を希望するプラン"));
      if (idx !== -1) bodyLines[idx] = `制作を希望するプラン：${label}`;
    }
  }
  const mailtoHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        guide.mailSubject
      )}&body=${encodeURIComponent(bodyLines.join("\r\n"))}`
    : "#";

  document.querySelectorAll("[data-contact-mail]").forEach((el) => {
    if (email) {
      el.href = mailtoHref;
    } else {
      el.href = "#";
      el.classList.add("is-disabled");
      el.setAttribute("aria-disabled", "true");
      el.addEventListener("click", (e) => e.preventDefault());
    }
  });
}

/* -------------------------------------------------------------
 * スマホ用ナビ開閉
 * ----------------------------------------------------------- */

function setupMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
    document.body.classList.remove("nav-open");
  };
  const open = () => {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "メニューを閉じる");
    document.body.classList.add("nav-open");
  };

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) close();
    else open();
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* -------------------------------------------------------------
 * スマホ用 固定CTA（フッターが見えたら引っ込める）
 * ----------------------------------------------------------- */

function setupStickyCta() {
  const bar = document.querySelector(".sticky-cta");
  const footer = document.querySelector(".site-footer");
  if (!bar || !footer || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        bar.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -40px 0px" }
  );
  io.observe(footer);
}

/* -------------------------------------------------------------
 * 右下フローティング問い合わせボタン（＋初回のみの吹き出し）
 * ----------------------------------------------------------- */

const INQUIRY_HASH = "#inquiry-form";
const BUBBLE_STORAGE_KEY = "promeonFloatingBubbleSeen";

/** パス末尾の index.html / 余分なスラッシュを取り除いて比較しやすくする */
function normalizePath(path) {
  return path.replace(/index\.html$/, "").replace(/\/+$/, "") || "/";
}

function scrollToInquiryForm(smooth) {
  const target = document.getElementById("inquiry-form");
  if (!target) return false;
  target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  return true;
}

function setupFloatingContact() {
  const wrap = document.querySelector("[data-floating-contact]");
  if (!wrap) return;

  const link = wrap.querySelector(".floating-contact__btn");
  if (link) {
    link.addEventListener("click", (e) => {
      let dest;
      try {
        dest = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      // 同一ページ内なら、遷移せずフォームまでスムーズスクロール
      if (normalizePath(dest.pathname) === normalizePath(window.location.pathname)) {
        if (scrollToInquiryForm(true)) {
          e.preventDefault();
          if (window.history && history.replaceState) {
            history.replaceState(null, "", INQUIRY_HASH);
          }
        }
      }
      // 別ページからの場合は通常遷移（遷移先で hash によりフォーム位置へ移動）
    });
  }

  // 初回のみの小さな吹き出し（スマホ・問い合わせページ・低モーション設定では出さない）
  const bubble = wrap.querySelector("[data-floating-bubble]");
  if (!bubble) return;

  const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
  const onContactPage = normalizePath(window.location.pathname) === "/contact";
  let alreadySeen = true;
  try {
    alreadySeen = localStorage.getItem(BUBBLE_STORAGE_KEY) === "1";
  } catch {
    alreadySeen = true; // localStorage が使えない環境ではしつこく出さない
  }

  if (isSmallScreen || onContactPage || alreadySeen) return;

  try {
    localStorage.setItem(BUBBLE_STORAGE_KEY, "1");
  } catch {
    /* 保存できなくても表示は継続する */
  }

  // 表示・非表示は has-bubble クラス（CSS でフェード）で制御する
  bubble.hidden = false;
  window.setTimeout(() => wrap.classList.add("has-bubble"), 1400);
  window.setTimeout(() => wrap.classList.remove("has-bubble"), 8000);
}

/* -------------------------------------------------------------
 * 無料相談・お問い合わせフォーム
 * ----------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+/i;

function setupInquiryForm() {
  const form = document.getElementById("inquiry-form-el");
  if (!form) return;

  const submitBtn = form.querySelector("[data-inquiry-submit]");
  const alertBox = form.querySelector("[data-inquiry-alert]");
  const successBox = document.querySelector("[data-inquiry-success]");
  const siteUrlField = form.querySelector("[data-site-url-field]");
  const siteUrlInput = form.querySelector("#if-siteurl");
  const elapsedInput = form.querySelector("[data-inquiry-elapsed]");
  const startedAt = Date.now();

  const fieldError = (name) =>
    form.querySelector(`.form-error[data-error-for="${name}"]`);

  function setError(name, message) {
    const el = fieldError(name);
    const input = form.querySelector(`[name="${name}"]`);
    if (el) {
      el.textContent = message ? `⚠ ${message}` : "";
      el.hidden = !message;
    }
    if (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      // ラジオはグループ全体
      if (input.type === "radio") {
        form.querySelectorAll(`[name="${name}"]`).forEach((r) => {
          if (message) r.setAttribute("aria-invalid", "true");
          else r.removeAttribute("aria-invalid");
        });
      }
    }
  }

  function clearAllErrors() {
    form.querySelectorAll(".form-error").forEach((el) => {
      el.textContent = "";
      el.hidden = true;
    });
    form
      .querySelectorAll('[aria-invalid="true"]')
      .forEach((el) => el.removeAttribute("aria-invalid"));
    if (alertBox) {
      alertBox.textContent = "";
      alertBox.hidden = true;
    }
  }

  // 「はい」を選んだときだけ URL 欄を表示
  function syncSiteUrlVisibility() {
    const checked = form.querySelector('[name="hasSite"]:checked');
    const show = checked && checked.value === "はい";
    if (siteUrlField) siteUrlField.hidden = !show;
    if (!show) {
      if (siteUrlInput) siteUrlInput.value = "";
      setError("siteUrl", "");
    }
  }
  form.querySelectorAll("[data-has-site]").forEach((radio) => {
    radio.addEventListener("change", syncSiteUrlVisibility);
  });
  syncSiteUrlVisibility();

  function validate() {
    clearAllErrors();
    const data = new FormData(form);
    let firstInvalid = null;

    const requireField = (name, message) => {
      const value = String(data.get(name) || "").trim();
      if (!value) {
        setError(name, message);
        if (!firstInvalid) firstInvalid = form.querySelector(`[name="${name}"]`);
        return false;
      }
      return true;
    };

    requireField("name", "お名前を入力してください。");

    const email = String(data.get("email") || "").trim();
    if (!email) {
      setError("email", "メールアドレスを入力してください。");
      if (!firstInvalid) firstInvalid = form.querySelector('[name="email"]');
    } else if (!EMAIL_RE.test(email)) {
      setError("email", "メールアドレスの形式が正しくありません。");
      if (!firstInvalid) firstInvalid = form.querySelector('[name="email"]');
    }

    requireField("category", "ご相談内容を選択してください。");

    // URL 欄が表示されていて入力がある場合のみ形式チェック（任意項目）
    if (siteUrlField && !siteUrlField.hidden) {
      const url = String(data.get("siteUrl") || "").trim();
      if (url && !URL_RE.test(url)) {
        setError(
          "siteUrl",
          "URLの形式が正しくありません（https:// から始まる形式でご入力ください）。"
        );
        if (!firstInvalid) firstInvalid = siteUrlInput;
      }
    }

    requireField("message", "ご相談・お問い合わせ内容を入力してください。");

    if (!form.querySelector("#if-privacy").checked) {
      setError("privacy", "プライバシーポリシーへの同意が必要です。");
      if (!firstInvalid) firstInvalid = form.querySelector("#if-privacy");
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      return null;
    }

    return {
      name: String(data.get("name") || "").trim(),
      company: String(data.get("company") || "").trim(),
      email,
      category: String(data.get("category") || "").trim(),
      hasSite: String(data.get("hasSite") || "").trim(),
      siteUrl:
        siteUrlField && !siteUrlField.hidden
          ? String(data.get("siteUrl") || "").trim()
          : "",
      budget: String(data.get("budget") || "").trim(),
      deadline: String(data.get("deadline") || "").trim(),
      message: String(data.get("message") || "").trim(),
      privacy: true,
      website: String(data.get("website") || ""),
      elapsed_ms: Date.now() - startedAt,
    };
  }

  function showAlert(message) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.hidden = false;
  }

  function setSubmitting(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "送信中..." : "無料で相談する";
    submitBtn.classList.toggle("is-disabled", on);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn && submitBtn.disabled) return;

    if (elapsedInput) elapsedInput.value = String(Date.now() - startedAt);

    const payload = validate();
    if (!payload) return;

    setSubmitting(true);

    const endpoint = form.getAttribute("action") || "/api/contact";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      let body = {};
      try {
        body = await res.json();
      } catch {
        body = {};
      }

      const succeeded =
        res.ok && (body.success === true || body.ok === true);

      if (succeeded) {
        if (successBox) {
          successBox.hidden = false;
          form.hidden = true;
          successBox.setAttribute("tabindex", "-1");
          successBox.focus({ preventScroll: true });
          successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // サーバー側の項目別エラーを反映
      if (res.status === 422 && body.fields) {
        Object.entries(body.fields).forEach(([name, message]) =>
          setError(name, String(message))
        );
        showAlert("入力内容をご確認ください。");
        setSubmitting(false);
        return;
      }

      // 本当の失敗理由を開発者コンソールに出す（秘密情報は含めない）。
      // ネットワークタブの POST /api/contact のステータスと合わせて確認してください。
      console.error(
        "[inquiry] 送信失敗:",
        JSON.stringify({
          endpoint,
          httpStatus: res.status,
          error: body.error || null,
          stage: body.stage || null,
          detail: body.detail || null,
        })
      );

      showAlert("送信に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    } catch (err) {
      console.error("[inquiry] fetch 失敗（ネットワーク/CORS など）:", endpoint, err);
      showAlert("送信に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  });
}

/* -------------------------------------------------------------
 * 初期化
 * ----------------------------------------------------------- */

function init() {
  mountChrome();
  setupLogoFallback();
  renderCommonText();
  renderContactLinks();
  setCanonical();
  renderSectionHeads();
  renderMedia();

  renderHome();
  renderPlansPage();
  renderSamplesPage();
  renderFlowPage();
  renderFaqPage();
  renderContactPage();
  renderContactSns();

  setupMedia();
  setupMobileNav();
  setupStickyCta();
  setupFloatingContact();
  setupInquiryForm();

  // ヘッダー等を差し込んだ後にレイアウトが変わるため、
  // #inquiry-form 付きで来た場合は着地位置を取り直す。
  if (window.location.hash === INQUIRY_HASH) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => scrollToInquiryForm(false));
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
