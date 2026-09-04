import { esc, nl2br, arrowIcon } from "./shared.js";
import { hero } from "../config.js";

/**
 * ① ファーストビュー
 * 構造は motion/hero.js の GSAP timeline から参照される：
 *   .hero__veil  … 白レイヤー（最初に画面を覆い、フェード/スケールで退場）
 *   .hero__media … 背景写真（scale 1.08 → 1.0 でズームアウト）
 *   .hero__copy  … キャッチ／サブ／CTA（背景より少し遅れて fadeUp）
 */
export function renderHero() {
  return `
  <section class="hero" data-hero>
    <div class="hero__media" data-hero-media>
      <picture>
        <source srcset="${esc(withExt(hero.image, "webp"))}" type="image/webp" />
        <img
          src="${esc(hero.image)}"
          alt="${esc(hero.imageAlt)}"
          fetchpriority="high"
          decoding="async"
          onerror="this.closest('.hero__media').classList.add('is-imgless')"
        />
      </picture>
      <span class="hero__scrim" aria-hidden="true"></span>
    </div>

    <div class="hero__inner container">
      <div class="hero__copy" data-hero-copy>
        <h1 class="hero__title">${nl2br(hero.copy)}</h1>
        <p class="hero__sub">${esc(hero.sub)}</p>
        <div class="hero__actions">
          <a class="btn btn--accent btn--lg" href="${esc(hero.primaryCta.href)}">
            ${esc(hero.primaryCta.label)}${arrowIcon()}
          </a>
          <a class="btn btn--ghost btn--on-navy btn--lg" href="${esc(hero.secondaryCta.href)}">
            ${esc(hero.secondaryCta.label)}${arrowIcon()}
          </a>
        </div>
      </div>
    </div>

    <div class="hero__veil" data-hero-veil aria-hidden="true"></div>

    <a class="hero__scroll" href="#issues" aria-label="下へスクロール">
      <span class="hero__scroll-line" aria-hidden="true"></span>
    </a>
  </section>`;
}

/** "/images/hero.jpg" -> "/images/hero.webp" */
function withExt(path, ext) {
  return String(path).replace(/\.[a-z0-9]+$/i, `.${ext}`);
}
