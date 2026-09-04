import { esc, sectionHead } from "./shared.js";
import { pillars } from "../config.js";

/** ④ 支援方針（3本柱）— カード */
export function renderPillars() {
  const cards = pillars.items
    .map(
      (item, i) => `
      <li class="pillar-card pillar-card--${esc(item.key)}" data-reveal data-reveal-stagger="${i}">
        <span class="pillar-card__label u-gothic">${esc(item.label)}</span>
        <h3 class="pillar-card__headline">${esc(item.headline)}</h3>
        <p class="pillar-card__body">${esc(item.body)}</p>
      </li>`
    )
    .join("");

  return `
  <section class="section section--alt" id="pillars" aria-labelledby="pillars-title">
    <div class="container">
      ${sectionHead({ eyebrow: "Our approach", title: pillars.heading, id: "pillars-title" })}
      <ul class="pillar-grid" data-reveal-group>${cards}</ul>
    </div>
  </section>`;
}
