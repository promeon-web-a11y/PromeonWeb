import { esc, arrowIcon } from "./shared.js";
import { checklist } from "../config.js";

/**
 * /checklist/ の骨組みを描画する。
 * 画面遷移・判定ロジックは motion/wizard.js が担当（[data-wizard] 配下を制御）。
 */
export function renderChecklistApp() {
  const totalSteps = checklist.steps.length;

  const stepsMarkup = checklist.steps
    .map((step, i) => {
      const inputType = step.type === "multiple" ? "checkbox" : "radio";
      const options = step.options
        .map(
          (opt) => `
        <label class="wizard-option">
          <input type="${inputType}" name="${esc(step.id)}" value="${esc(opt.value)}" />
          <span class="wizard-option__box" aria-hidden="true"></span>
          <span class="wizard-option__label">${esc(opt.label)}</span>
        </label>`
        )
        .join("");

      return `
      <fieldset class="wizard-step" data-step="${i}"${i === 0 ? "" : " hidden"}>
        <legend class="wizard-step__question">
          <span class="wizard-step__count u-en">Step ${i + 1} / ${totalSteps}</span>
          ${esc(step.question)}
          ${step.type === "multiple" ? '<span class="wizard-step__hint">（複数選択可）</span>' : ""}
        </legend>
        <div class="wizard-step__options">${options}</div>
      </fieldset>`;
    })
    .join("");

  return `
  <section class="wizard-section">
    <div class="container container--narrow">
      <header class="wizard-intro" data-wizard-intro>
        <span class="section-head__eyebrow">Diagnosis</span>
        <h1 class="wizard-intro__title">${esc(checklist.intro.heading)}</h1>
        <p class="wizard-intro__lead">${esc(checklist.intro.lead)}</p>
        <button class="btn btn--accent btn--lg" type="button" data-wizard-start>
          ${esc(checklist.intro.startLabel)}${arrowIcon()}
        </button>
      </header>

      <form class="wizard" data-wizard hidden>
        <div class="wizard__progress" data-wizard-progress>
          <div class="wizard__progress-head">
            <span data-wizard-progress-label>Step 1 / ${totalSteps}</span>
            <span data-wizard-progress-pct>0%</span>
          </div>
          <div class="wizard__progress-track">
            <span class="wizard__progress-bar" data-wizard-progress-bar></span>
          </div>
        </div>

        <div class="wizard__viewport">
          <div class="wizard__rail" data-wizard-rail>
            ${stepsMarkup}
          </div>
        </div>

        <div class="wizard__nav">
          <button class="btn btn--ghost" type="button" data-wizard-prev hidden>戻る</button>
          <button class="btn btn--accent" type="button" data-wizard-next>
            次へ${arrowIcon()}
          </button>
        </div>
      </form>

      <div class="wizard-result" data-wizard-result hidden>
        <span class="section-head__eyebrow">Result</span>
        <h2 class="wizard-result__title" data-result-title></h2>
        <p class="wizard-result__summary" data-result-summary></p>
        <ul class="wizard-result__actions" data-result-actions></ul>

        <div class="wizard-result__outro">
          <h3>${esc(checklist.outro.heading)}</h3>
          <p>${esc(checklist.outro.body)}</p>
          <div class="wizard-result__cta">
            <a class="btn btn--accent btn--lg" href="${esc(checklist.outro.cta.href)}">
              ${esc(checklist.outro.cta.label)}${arrowIcon()}
            </a>
            <button class="btn btn--ghost" type="button" data-wizard-restart>もう一度診断する</button>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
