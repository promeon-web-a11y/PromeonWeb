import { esc } from "./shared.js";
import { sectionHead } from "./shared.js";
import { issues } from "../config.js";

/** ② 業界特有の“あるある課題”（共感セクション） */
export function renderIssues() {
  const cards = issues.items
    .map(
      (item, i) => `
      <li class="issue-card" data-reveal data-reveal-stagger="${i}">
        <span class="issue-card__index u-en" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <h3 class="issue-card__title">${esc(item.title)}</h3>
        <p class="issue-card__body">${esc(item.body)}</p>
      </li>`
    )
    .join("");

  return `
  <section class="section section--alt" id="issues" aria-labelledby="issues-title">
    <div class="container">
      ${sectionHead({ eyebrow: "Issues", title: issues.heading, lead: issues.lead, id: "issues-title" })}
      <ul class="issue-grid" data-reveal-group>${cards}</ul>
    </div>
  </section>`;
}
