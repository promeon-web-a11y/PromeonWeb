import { esc, sectionHead } from "./shared.js";
import { faq } from "../config.js";

/** ⑨ よくある質問 — アコーディオン（開閉は height/opacity をスムーズに） */
export function renderFaq() {
  const items = faq.items
    .map(
      (item, i) => `
      <div class="accordion__item" data-reveal data-reveal-stagger="${i}">
        <h3 class="accordion__heading">
          <button class="accordion__trigger" type="button" aria-expanded="false" aria-controls="faq-panel-${i}" id="faq-trigger-${i}">
            <span class="accordion__title">${esc(item.q)}</span>
            <span class="accordion__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="accordion__panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-trigger-${i}" hidden>
          <div class="accordion__panel-inner">
            <p>${esc(item.a)}</p>
          </div>
        </div>
      </div>`
    )
    .join("");

  return `
  <section class="section" id="faq" aria-labelledby="faq-title">
    <div class="container container--narrow">
      ${sectionHead({ eyebrow: "FAQ", title: faq.heading, id: "faq-title" })}
      <div class="accordion" data-accordion>${items}</div>
    </div>
  </section>`;
}
