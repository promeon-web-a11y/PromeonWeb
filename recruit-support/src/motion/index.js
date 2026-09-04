// ==============================================================
//  アニメーションの初期化オーケストレーター
//  - 各演出は機能ごとにモジュール分割（同ディレクトリ内）
//  - prefers-reduced-motion は各モジュール側で尊重
// ==============================================================

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { watchMotionPreference, prefersReducedMotion } from "./env.js";
import { initSmoothScroll } from "./smoothScroll.js";
import { initHeader } from "./header.js";
import { initHero } from "./hero.js";
import { initReveal } from "./reveal.js";
import { initCounters } from "./counters.js";
import { initRoadmap } from "./roadmap.js";
import { initAccordions } from "./accordion.js";
import { initParallax } from "./parallax.js";
import { initCarousels } from "./carousel.js";

gsap.registerPlugin(ScrollTrigger);

/**
 * トップページ用の演出をまとめて初期化。
 */
export function initTopPageMotion() {
  watchMotionPreference();

  const deps = { gsap, ScrollTrigger };

  // ヘッダーとアコーディオンは「動きの装飾」ではなく機能なので常に初期化
  initHeader();
  initAccordions({ gsap: prefersReducedMotion() ? null : gsap });

  // スムーススクロール（低減時は null）
  initSmoothScroll(deps);

  // 演出系
  initHero({ gsap });
  initReveal(deps);
  initCounters(deps);
  initRoadmap(deps);
  initParallax(deps);
  initCarousels();

  // 画像読み込み等でレイアウトが変わった後に位置を再計算
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };
