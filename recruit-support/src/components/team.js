import { esc, sectionHead } from "./shared.js";
import { team } from "../config.js";

/**
 * ⑧ 代表・チームの想い
 * 顔写真にホバー（フォーカス）で一言メッセージが浮かび上がる。
 * 画像が無い場合はイニシャル風のプレースホルダーにフォールバック。
 */
export function renderTeam() {
  const members = team.members
    .map((m, i) => {
      const webp = String(m.photo).replace(/\.[a-z0-9]+$/i, ".webp");
      return `
      <li class="team-card" data-reveal data-reveal-stagger="${i}" tabindex="0">
        <div class="team-card__photo">
          <picture>
            <source srcset="${esc(webp)}" type="image/webp" />
            <img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy" decoding="async"
              onerror="this.closest('.team-card__photo').classList.add('is-imgless')" />
          </picture>
          <span class="team-card__message" aria-hidden="true">${esc(m.message)}</span>
        </div>
        <p class="team-card__name">${esc(m.name)}</p>
        <p class="team-card__role u-gothic">${esc(m.role)}</p>
        <p class="team-card__message-sr visually-hidden">${esc(m.message)}</p>
      </li>`;
    })
    .join("");

  return `
  <section class="section section--alt" id="team" aria-labelledby="team-title">
    <div class="container">
      ${sectionHead({ eyebrow: "People", title: team.heading, lead: team.lead, id: "team-title" })}
      <ul class="team-grid" data-reveal-group>${members}</ul>
    </div>
  </section>`;
}
