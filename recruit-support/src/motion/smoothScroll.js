import Lenis from "lenis";
import { prefersReducedMotion } from "./env.js";

/**
 * Lenis による慣性スクロール。
 * - モーション低減時は初期化しない（ネイティブスクロールのまま）
 * - GSAP ScrollTrigger と同期させるため rAF は gsap.ticker から回す想定
 * @param {{ gsap?: object, ScrollTrigger?: object }} deps
 * @returns {Lenis|null}
 */
export function initSmoothScroll({ gsap, ScrollTrigger } = {}) {
  if (prefersReducedMotion()) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  if (gsap && ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // ページ内アンカーを Lenis 経由でスムーズに
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80 });
  });

  return lenis;
}
