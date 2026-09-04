import { prefersReducedMotion } from "./env.js";

/**
 * ⑤サービス / ⑨FAQ 共通のアコーディオン。
 * [data-accordion] ごとに独立。開閉時に height/opacity をスムーズにアニメーション。
 * モーション低減時は即時開閉（表示自体は保証）。
 * @param {{ gsap?: object }} deps
 */
export function initAccordions({ gsap } = {}) {
  const groups = document.querySelectorAll("[data-accordion]");
  if (!groups.length) return;

  const reduce = prefersReducedMotion() || !gsap;

  groups.forEach((group) => {
    const items = Array.from(group.querySelectorAll(".accordion__item"));

    const open = (panel, animate = true) => {
      panel.hidden = false;
      if (reduce || !animate) {
        gsap?.set(panel, { height: "auto", opacity: 1 });
        return;
      }
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.42,
          ease: "power2.out",
          clearProps: "height",
        }
      );
    };

    const close = (panel, animate = true) => {
      if (reduce || !animate) {
        panel.hidden = true;
        return;
      }
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration: 0.32,
        ease: "power2.in",
        onComplete: () => {
          panel.hidden = true;
          gsap.set(panel, { clearProps: "height,opacity" });
        },
      });
    };

    items.forEach((item) => {
      const trigger = item.querySelector(".accordion__trigger");
      const panel = item.querySelector(".accordion__panel");
      if (!trigger || !panel) return;

      // 初期状態（aria-expanded に従う）
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      panel.hidden = !expanded;

      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!isOpen));
        if (isOpen) close(panel);
        else open(panel);
      });
    });
  });
}
