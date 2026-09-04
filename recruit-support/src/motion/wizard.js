import { prefersReducedMotion } from "./env.js";
import { checklist } from "../config.js";

/**
 * 採用課題診断ウィザード。
 * - ステップ切り替え：フェード＋横スライド（[data-wizard-rail] を translateX）
 * - 上部プログレスバーで進捗を可視化
 * - 回答（problems の多肢選択）から結果タイプを分岐
 * @param {{ gsap?: object }} deps
 */
export function initWizard({ gsap } = {}) {
  const root = document.querySelector("[data-wizard]");
  if (!root) return;

  const intro = document.querySelector("[data-wizard-intro]");
  const resultBox = document.querySelector("[data-wizard-result]");
  const rail = root.querySelector("[data-wizard-rail]");
  const steps = Array.from(rail.querySelectorAll(".wizard-step"));
  const prevBtn = root.querySelector("[data-wizard-prev]");
  const nextBtn = root.querySelector("[data-wizard-next]");
  const progressBar = root.querySelector("[data-wizard-progress-bar]");
  const progressLabel = root.querySelector("[data-wizard-progress-label]");
  const progressPct = root.querySelector("[data-wizard-progress-pct]");

  const reduce = prefersReducedMotion() || !gsap;
  const total = steps.length;
  let current = 0;

  const answers = {}; // { [stepId]: string | string[] }

  /* ---- 表示更新 ------------------------------------------------ */
  function layout() {
    steps.forEach((step, i) => {
      step.hidden = i !== current;
    });
    const pct = Math.round(((current + 1) / total) * 100);
    progressBar.style.width = `${pct}%`;
    progressLabel.textContent = `Step ${current + 1} / ${total}`;
    progressPct.textContent = `${pct}%`;
    prevBtn.hidden = current === 0;
    nextBtn.textContent = current === total - 1 ? "診断結果を見る" : "次へ";
    nextBtn.appendChild(arrow());
    syncNextDisabled();
  }

  function arrow() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "btn__arrow");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      '<path d="M1 8h12M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
    return svg;
  }

  function transitionTo(nextIndex, dir) {
    const prevIndex = current;
    current = Math.max(0, Math.min(total - 1, nextIndex));
    if (reduce || prevIndex === current) {
      layout();
      focusStep();
      return;
    }
    const offset = dir === "next" ? 40 : -40;
    gsap.fromTo(
      rail,
      { autoAlpha: 0, x: offset },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.4,
        ease: "power2.out",
        onStart: layout,
        onComplete: focusStep,
      }
    );
  }

  function focusStep() {
    const legend = steps[current].querySelector(".wizard-step__question");
    legend?.setAttribute("tabindex", "-1");
    legend?.focus({ preventScroll: true });
  }

  /* ---- 回答の収集 -------------------------------------------- */
  function collect(stepIndex) {
    const step = checklist.steps[stepIndex];
    const inputs = Array.from(
      steps[stepIndex].querySelectorAll(`input[name="${step.id}"]`)
    );
    if (step.type === "multiple") {
      answers[step.id] = inputs.filter((i) => i.checked).map((i) => i.value);
    } else {
      const checked = inputs.find((i) => i.checked);
      answers[step.id] = checked ? checked.value : null;
    }
  }

  function isStepAnswered(stepIndex) {
    const step = checklist.steps[stepIndex];
    const inputs = Array.from(
      steps[stepIndex].querySelectorAll(`input[name="${step.id}"]`)
    );
    return inputs.some((i) => i.checked);
  }

  function syncNextDisabled() {
    nextBtn.disabled = !isStepAnswered(current);
  }

  /* ---- 結果分岐 --------------------------------------------- */
  const PROBLEM_CATEGORY = {
    few_applicants: "acquisition",
    media: "acquisition",
    decline: "conversion",
    ops: "conversion",
    early_turnover: "retention",
    sns: "branding",
  };

  function decideResult() {
    const problems = answers.problems || [];
    if (!problems.length) return checklist.results.balanced;

    const tally = {};
    problems.forEach((p) => {
      const cat = PROBLEM_CATEGORY[p];
      if (cat) tally[cat] = (tally[cat] || 0) + 1;
    });

    const cats = Object.keys(tally);
    if (cats.length >= 3) return checklist.results.balanced;

    const top = cats.sort((a, b) => tally[b] - tally[a]);
    if (cats.length === 2 && tally[top[0]] === tally[top[1]]) {
      return checklist.results.balanced;
    }
    return checklist.results[top[0]] || checklist.results.balanced;
  }

  function showResult() {
    const result = decideResult();
    resultBox.querySelector("[data-result-title]").textContent = result.title;
    resultBox.querySelector("[data-result-summary]").textContent = result.summary;
    const list = resultBox.querySelector("[data-result-actions]");
    list.innerHTML = result.actions
      .map((a) => `<li>${a.replace(/</g, "&lt;")}</li>`)
      .join("");

    root.hidden = true;
    resultBox.hidden = false;
    resultBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (!reduce) {
      gsap.from(resultBox.children, {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }
  }

  /* ---- イベント -------------------------------------------- */
  document.querySelector("[data-wizard-start]")?.addEventListener("click", () => {
    intro.hidden = true;
    root.hidden = false;
    layout();
    if (!reduce) {
      gsap.from(root, { autoAlpha: 0, y: 16, duration: 0.4, ease: "power2.out" });
    }
    focusStep();
  });

  nextBtn.addEventListener("click", () => {
    collect(current);
    if (!isStepAnswered(current)) return;
    if (current === total - 1) {
      showResult();
    } else {
      transitionTo(current + 1, "next");
    }
  });

  prevBtn.addEventListener("click", () => {
    collect(current);
    transitionTo(current - 1, "prev");
  });

  rail.addEventListener("change", (e) => {
    if (e.target.matches("input")) syncNextDisabled();
  });

  document.querySelector("[data-wizard-restart]")?.addEventListener("click", () => {
    Object.keys(answers).forEach((k) => delete answers[k]);
    rail.querySelectorAll("input").forEach((i) => (i.checked = false));
    current = 0;
    resultBox.hidden = true;
    intro.hidden = false;
    root.hidden = true;
    intro.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  layout();
}
