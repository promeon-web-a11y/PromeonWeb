import { esc, arrowIcon } from "./shared.js";
import { checklistBanner } from "../config.js";

/** ⑦ 採用課題診断への誘導バナー（ハードルの低いCTA） */
export function renderChecklistBanner() {
  return `
  <section class="section" aria-labelledby="checklist-banner-title">
    <div class="container">
      <a class="checklist-banner" href="${esc(checklistBanner.cta.href)}" data-reveal>
        <div class="checklist-banner__text">
          <h2 class="checklist-banner__title" id="checklist-banner-title">${esc(checklistBanner.heading)}</h2>
          <p class="checklist-banner__body">${esc(checklistBanner.body)}</p>
        </div>
        <span class="checklist-banner__cta">
          <span class="btn btn--accent btn--lg">${esc(checklistBanner.cta.label)}${arrowIcon()}</span>
        </span>
      </a>
    </div>
  </section>`;
}
