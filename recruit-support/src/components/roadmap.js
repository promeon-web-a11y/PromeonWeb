import { esc, sectionHead, arrowIcon } from "./shared.js";
import { roadmap } from "../config.js";

/**
 * ⑥ 3ヶ月ロードマップ
 * - スクロールに応じて接続線（プログレスライン）が伸びる
 *   motion/roadmap.js が [data-roadmap] / [data-roadmap-progress] を制御。
 */
export function renderRoadmap() {
  const steps = roadmap.steps
    .map(
      (step, i) => `
      <li class="roadmap-step" data-reveal data-reveal-stagger="${i}">
        <div class="roadmap-step__marker" aria-hidden="true">
          <span class="roadmap-step__dot"></span>
        </div>
        <div class="roadmap-step__card">
          <span class="roadmap-step__month u-en">Month ${i + 1}</span>
          <span class="roadmap-step__month-ja">${esc(step.month)}</span>
          <h3 class="roadmap-step__title">${esc(step.title)}</h3>
          <ul class="roadmap-step__list">
            ${step.items.map((t) => `<li>${esc(t)}</li>`).join("")}
          </ul>
        </div>
      </li>`
    )
    .join("");

  return `
  <section class="section section--navy" id="roadmap" aria-labelledby="roadmap-title">
    <div class="container">
      ${sectionHead({ eyebrow: "Roadmap", title: roadmap.heading, lead: roadmap.lead, id: "roadmap-title" })}
      <div class="roadmap" data-roadmap>
        <span class="roadmap__track" aria-hidden="true">
          <span class="roadmap__progress" data-roadmap-progress></span>
        </span>
        <ol class="roadmap__steps" data-reveal-group>${steps}</ol>
      </div>
      <div class="roadmap__cta" data-reveal>
        <a class="btn btn--on-navy btn--lg" href="${esc(roadmap.cta.href)}" data-download>
          ${esc(roadmap.cta.label)}${arrowIcon()}
        </a>
      </div>
    </div>
  </section>`;
}
