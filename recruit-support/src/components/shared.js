// 共通のレンダリングヘルパー

/** HTMLエスケープ（属性・テキスト共用の最小限） */
export function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 改行(\n)を <br> に変換（各行はエスケープ済み） */
export function nl2br(value = "") {
  return String(value)
    .split("\n")
    .map((line) => esc(line))
    .join("<br>");
}

/** セクション見出しブロック */
export function sectionHead({ eyebrow, title, lead, id } = {}) {
  return `
    <div class="section-head" data-reveal>
      ${eyebrow ? `<span class="section-head__eyebrow">${esc(eyebrow)}</span>` : ""}
      <h2 class="section-head__title"${id ? ` id="${esc(id)}"` : ""}>${nl2br(title)}</h2>
      ${lead ? `<p class="section-head__lead">${nl2br(lead)}</p>` : ""}
    </div>`;
}

/** 右矢印アイコン（マイクロインタラクション用） */
export function arrowIcon() {
  return `<svg class="btn__arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M1 8h12M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/** ボタン */
export function button({ label, href, variant = "", size = "", reveal = false } = {}) {
  const cls = ["btn", variant, size].filter(Boolean).join(" ");
  const attrs = reveal ? " data-reveal" : "";
  return `<a class="${cls}" href="${esc(href)}"${attrs}>${esc(label)}${arrowIcon()}</a>`;
}
