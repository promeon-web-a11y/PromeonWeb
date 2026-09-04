import { prefersReducedMotion } from "./env.js";

/**
 * ⑥ 3ヶ月ロードマップのプログレスライン。
 * セクションのスクロール進行に合わせて [data-roadmap-progress] の
 * height（縦）／width（横）を 0 → 100% に伸ばす。
 * モーション低減時は最初から 100% 表示。
 * @param {{ gsap: object, ScrollTrigger: object }} deps
 */
export function initRoadmap({ gsap, ScrollTrigger } = {}) {
  const root = document.querySelector("[data-roadmap]");
  const progress = root?.querySelector("[data-roadmap-progress]");
  if (!root || !progress) return;

  const isHorizontal = () => window.matchMedia("(min-width: 900px)").matches;

  if (prefersReducedMotion() || !gsap || !ScrollTrigger) {
    progress.style.setProperty("--progress", "100%");
    return;
  }

  gsap.to(progress, {
    "--progress": "100%",
    ease: "none",
    scrollTrigger: {
      trigger: root,
      start: "top 70%",
      end: "bottom 80%",
      scrub: 0.6,
    },
  });

  // 横／縦の切り替え時に再計算
  window.addEventListener("resize", () => ScrollTrigger.refresh());
  void isHorizontal;
}
