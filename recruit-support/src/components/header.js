import { esc } from "./shared.js";
import { site, nav } from "../config.js";

/**
 * サイトヘッダー。
 * - 初期は透明背景、スクロールで白背景＋影（motion/header.js が .is-scrolled を付与）
 * - ロゴサイズもスクロールでわずかに縮小
 * @param {boolean} opts.solid  トップ以外のページで最初から白背景にしたい場合 true
 */
export function renderHeader({ solid = false } = {}) {
  const links = nav
    .map((item) => `<li><a class="site-nav__link" href="${esc(item.href)}">${esc(item.label)}</a></li>`)
    .join("");

  return `
  <header class="site-header${solid ? " is-solid" : ""}" data-site-header>
    <div class="site-header__inner container">
      <a class="site-logo" href="/">
        <span class="site-logo__mark" aria-hidden="true"></span>
        <span class="site-logo__text">${esc(site.serviceName)}</span>
      </a>

      <nav class="site-nav" aria-label="メインナビゲーション">
        <ul class="site-nav__list">${links}</ul>
      </nav>

      <a class="btn btn--accent site-header__cta" href="${esc(site.contactUrl)}">無料相談</a>

      <button class="site-header__toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-toggle>
        <span class="site-header__toggle-bar" aria-hidden="true"></span>
        <span class="visually-hidden">メニューを開く</span>
      </button>
    </div>

    <div class="site-menu" id="site-menu" data-menu hidden>
      <nav class="site-menu__nav" aria-label="モバイルナビゲーション">
        <ul>
          ${nav.map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`).join("")}
          <li><a href="${esc(site.checklistUrl)}">採用課題診断</a></li>
        </ul>
      </nav>
      <a class="btn btn--accent btn--lg" href="${esc(site.contactUrl)}">無料相談を予約する</a>
    </div>
  </header>`;
}
