import { prefersReducedMotion } from "./env.js";

/**
 * 汎用スクロールイン。
 * - [data-reveal] を持つ要素が画面内に入ったら .is-inview を付与
 * - 親に [data-reveal-group] があると、子の [data-reveal] を
 *   data-reveal-stagger（無ければ出現順）に応じて 0.09s ずつ遅らせる
 * - モーション低減時は即座に全表示
 * @param {{ ScrollTrigger?: object }} deps
 */
export function initReveal({ ScrollTrigger } = {}) {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!items.length) return;

  if (prefersReducedMotion()) {
    items.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  const STEP = 0.09;

  const show = (el) => {
    const group = el.closest("[data-reveal-group]");
    let delay = 0;
    if (group) {
      const explicit = el.getAttribute("data-reveal-stagger");
      const siblings = Array.from(group.querySelectorAll("[data-reveal]"));
      const idx = explicit != null ? Number(explicit) : siblings.indexOf(el);
      delay = Math.max(0, idx) * STEP;
    }
    el.style.transitionDelay = `${delay}s`;
    el.classList.add("is-inview");
  };

  if (ScrollTrigger) {
    items.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => show(el),
      });
    });
    return;
  }

  // フォールバック：IntersectionObserver
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px" }
  );
  items.forEach((el) => io.observe(el));
}
