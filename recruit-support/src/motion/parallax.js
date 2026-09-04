import { prefersReducedMotion } from "./env.js";

/**
 * ⑩ CTA 背景の軽いパララックス。
 * [data-parallax] を、その要素が可視の間だけ y 方向にゆっくり移動させる。
 * モーション低減時は何もしない。
 * @param {{ gsap: object, ScrollTrigger: object }} deps
 */
export function initParallax({ gsap, ScrollTrigger } = {}) {
  if (prefersReducedMotion() || !gsap || !ScrollTrigger) return;

  document.querySelectorAll("[data-parallax]").forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}
