import { prefersReducedMotion } from "./env.js";

/**
 * ③ 数値のカウントアップ。
 * [data-count="48"] の要素が画面内に入ったら 0 → 目標値へ。
 * 誇張を避けるため duration は控えめ、イージングで自然に減速。
 * @param {{ gsap: object, ScrollTrigger: object }} deps
 */
export function initCounters({ gsap, ScrollTrigger } = {}) {
  const nodes = Array.from(document.querySelectorAll("[data-count]"));
  if (!nodes.length) return;

  const format = (n) => Math.round(n).toLocaleString("ja-JP");

  if (prefersReducedMotion() || !gsap || !ScrollTrigger) {
    nodes.forEach((el) => {
      el.textContent = format(Number(el.dataset.count) || 0);
    });
    return;
  }

  nodes.forEach((el) => {
    const target = Number(el.dataset.count) || 0;
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = format(obj.v);
          },
        });
      },
    });
  });
}
