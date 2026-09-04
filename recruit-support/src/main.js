// ==============================================================
//  トップページ エントリ
//  - コンテンツは src/config.js、描画は src/components/* に分離
//  - アニメーションは src/motion/* に分離
// ==============================================================

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/top.css";

import { site } from "./config.js";
import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { renderHero } from "./components/hero.js";
import { renderIssues } from "./components/issues.js";
import { renderReasons } from "./components/reasons.js";
import { renderPillars } from "./components/pillars.js";
import { renderService } from "./components/service.js";
import { renderRoadmap } from "./components/roadmap.js";
import { renderChecklistBanner } from "./components/checklistBanner.js";
import { renderTeam } from "./components/team.js";
import { renderFaq } from "./components/faq.js";
import { renderFinalCta } from "./components/finalCta.js";
import { initTopPageMotion } from "./motion/index.js";

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("has-js");

function mount() {
  const header = document.getElementById("site-header");
  const main = document.getElementById("main");
  const footer = document.getElementById("site-footer");

  if (header) header.outerHTML = renderHeader();
  if (footer) footer.outerHTML = renderFooter();

  if (main) {
    main.innerHTML = [
      renderHero(),
      renderIssues(),
      renderReasons(),
      renderPillars(),
      renderService(),
      renderRoadmap(),
      renderChecklistBanner(),
      renderTeam(),
      renderFaq(),
      renderFinalCta(),
    ].join("\n");
  }

  // タイトル/説明（HTML側の初期値を尊重しつつ補完）
  if (!document.title) document.title = `${site.serviceName}｜${site.tagline}`;
}

mount();
initTopPageMotion();
