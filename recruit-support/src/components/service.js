import { esc, sectionHead } from "./shared.js";
import { service } from "../config.js";

/**
 * ⑤ サービス内容 — アコーディオン
 * motion/accordion.js が [data-accordion] 内の <button> 開閉を制御する。
 */
export function renderService() {
  const items = service.items
    .map(
      (item, i) => `
      <div class="accordion__item" data-reveal data-reveal-stagger="${i}">
        <h3 class="accordion__heading">
          <button class="accordion__trigger" type="button" aria-expanded="${i === 0}" aria-controls="svc-panel-${i}" id="svc-trigger-${i}">
            <span class="accordion__title">${esc(item.title)}</span>
            <span class="accordion__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="accordion__panel" id="svc-panel-${i}" role="region" aria-labelledby="svc-trigger-${i}"${i === 0 ? "" : " hidden"}>
          <div class="accordion__panel-inner">
            <p>${esc(item.body)}</p>
          </div>
        </div>
      </div>`
    )
    .join("");

  return `
  <section class="section" id="service" aria-labelledby="service-title">
    <div class="container container--narrow">
      ${sectionHead({ eyebrow: "Service", title: service.heading, lead: service.lead, id: "service-title" })}
      <div class="accordion" data-accordion>${items}</div>
    </div>
  </section>`;
}
