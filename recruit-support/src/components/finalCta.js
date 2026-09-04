import { esc, nl2br, arrowIcon } from "./shared.js";
import { finalCta } from "../config.js";

/**
 * ⑩ CTA（無料相談）
 * 背景に軽いパララックス（motion/parallax.js が [data-parallax] を制御）。
 */
export function renderFinalCta() {
  const webp = String(finalCta.image).replace(/\.[a-z0-9]+$/i, ".webp");
  return `
  <section class="final-cta" id="contact-cta" aria-labelledby="final-cta-title">
    <div class="final-cta__bg" data-parallax aria-hidden="true">
      <picture>
        <source srcset="${esc(webp)}" type="image/webp" />
        <img src="${esc(finalCta.image)}" alt="" loading="lazy" decoding="async"
          onerror="this.closest('.final-cta__bg').classList.add('is-imgless')" />
      </picture>
    </div>
    <div class="container final-cta__inner" data-reveal>
      <h2 class="final-cta__title" id="final-cta-title">${nl2br(finalCta.heading)}</h2>
      <p class="final-cta__body">${esc(finalCta.body)}</p>
      <div class="final-cta__actions">
        <a class="btn btn--accent btn--lg" href="${esc(finalCta.primaryCta.href)}">
          ${esc(finalCta.primaryCta.label)}${arrowIcon()}
        </a>
        <a class="btn btn--ghost btn--on-navy btn--lg" href="${esc(finalCta.secondaryCta.href)}" data-download>
          ${esc(finalCta.secondaryCta.label)}${arrowIcon()}
        </a>
      </div>
    </div>
  </section>`;
}
