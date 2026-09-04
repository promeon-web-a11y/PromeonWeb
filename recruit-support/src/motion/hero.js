import { prefersReducedMotion } from "./env.js";

/**
 * ① ファーストビューのロード演出。
 * 白レイヤー → 背景写真ズームアウト → コピー fadeUp を GSAP timeline で連鎖。
 * モーション低減時は白レイヤーを即座に消し、コピーを静的表示。
 * @param {{ gsap: object }} deps
 */
export function initHero({ gsap } = {}) {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const veil = hero.querySelector("[data-hero-veil]");
  const media = hero.querySelector("[data-hero-media]");
  const copy = hero.querySelector("[data-hero-copy]");

  if (prefersReducedMotion() || !gsap) {
    if (veil) veil.style.display = "none";
    if (media) media.style.transform = "none";
    if (copy) copy.style.opacity = "1";
    hero.classList.add("is-ready");
    return;
  }

  // 初期状態
  gsap.set(media, { scale: 1.08, transformOrigin: "50% 55%" });
  gsap.set(copy.children, { opacity: 0, y: 28 });
  gsap.set(veil, { opacity: 1, scale: 1 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    delay: 0.15,
    onStart: () => hero.classList.add("is-ready"),
  });

  tl.to(veil, { opacity: 0, scale: 1.06, duration: 1.0, ease: "power2.inOut" }, 0.5)
    .set(veil, { display: "none" })
    .to(media, { scale: 1.0, duration: 1.6, ease: "power2.out" }, 0.6)
    .to(
      copy.children,
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 },
      0.95
    );

  return tl;
}
