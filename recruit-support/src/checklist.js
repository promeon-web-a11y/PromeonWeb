// ==============================================================
//  採用課題診断ページ（/checklist/）エントリ
// ==============================================================

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/checklist.css";

import { gsap } from "gsap";
import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { renderChecklistApp } from "./components/checklistApp.js";
import { initHeader } from "./motion/header.js";
import { initWizard } from "./motion/wizard.js";
import { initReveal } from "./motion/reveal.js";
import { watchMotionPreference, prefersReducedMotion } from "./motion/env.js";

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("has-js");

function mount() {
  const header = document.getElementById("site-header");
  const main = document.getElementById("main");
  const footer = document.getElementById("site-footer");

  if (header) header.outerHTML = renderHeader({ solid: true });
  if (footer) footer.outerHTML = renderFooter();
  if (main) main.innerHTML = renderChecklistApp();
}

mount();
watchMotionPreference();
initHeader();
initReveal({});
initWizard({ gsap: prefersReducedMotion() ? null : gsap });
