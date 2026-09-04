import { esc } from "./shared.js";
import { site, footer } from "../config.js";

export function renderFooter() {
  const links = footer.links
    .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
    .join("");

  return `
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <span class="site-logo__text">${esc(site.serviceName)}</span>
        <p class="site-footer__desc">${esc(site.description)}</p>
      </div>
      <nav class="site-footer__nav" aria-label="フッターナビゲーション">
        <ul>${links}</ul>
      </nav>
      <div class="site-footer__contact">
        ${site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ""}
        ${site.tel ? `<a href="tel:${esc(site.tel.replace(/[^0-9+]/g, ""))}">${esc(site.tel)}</a>` : ""}
      </div>
    </div>
    <div class="container site-footer__bottom">
      <small>${esc(footer.copyright)}</small>
    </div>
  </footer>`;
}
