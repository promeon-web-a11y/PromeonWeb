import { esc, sectionHead } from "./shared.js";
import { reasons } from "../config.js";

/**
 * ③ なぜ3ヶ月で結果が出せるのか（根拠）
 * - "仕組み" を図解風に見せる（AI → SNS → 現場理解 の3ステップ）
 * - 数値はカウントアップ（motion/counters.js が data-count を拾う）
 */
export function renderReasons() {
  const flow = reasons.points
    .map(
      (p, i) => `
      <li class="reason-step" data-reveal data-reveal-stagger="${i}">
        <span class="reason-step__num u-en" aria-hidden="true">0${i + 1}</span>
        <div class="reason-step__body">
          <h3 class="reason-step__title">${esc(p.title)}</h3>
          <p>${esc(p.body)}</p>
        </div>
        ${i < reasons.points.length - 1 ? '<span class="reason-step__connector" aria-hidden="true"></span>' : ""}
      </li>`
    )
    .join("");

  const stats = reasons.stats
    .map(
      (s) => `
      <div class="stat" data-reveal>
        <span class="stat__value u-en">
          <span data-count="${esc(s.value)}">0</span><span class="stat__suffix">${esc(s.suffix)}</span>
        </span>
        <span class="stat__label">${esc(s.label)}</span>
      </div>`
    )
    .join("");

  return `
  <section class="section" id="reasons" aria-labelledby="reasons-title">
    <div class="container">
      ${sectionHead({ eyebrow: "Why 3 months", title: reasons.heading, lead: reasons.lead, id: "reasons-title" })}
      <ol class="reason-flow" data-reveal-group>${flow}</ol>
      <div class="stat-row" data-reveal-group>${stats}</div>
      <p class="stat-note">${esc(reasons.statsNote)}</p>
    </div>
  </section>`;
}
