/**
 * ヘッダー：スクロールで透明 → 白背景＋影、ロゴをわずかに縮小。
 * - CSS 側の .is-scrolled で見た目を切り替える（トランジションは CSS）
 * - モバイルメニューの開閉もここで扱う
 */
export function initHeader() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const solid = header.classList.contains("is-solid");
  const THRESHOLD = 8;

  const update = () => {
    const scrolled = window.scrollY > THRESHOLD;
    header.classList.toggle("is-scrolled", scrolled || solid);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });

  // モバイルメニュー
  const toggle = header.querySelector("[data-menu-toggle]");
  const menu = header.querySelector("[data-menu]");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      header.classList.toggle("is-menu-open", open);
      document.body.classList.toggle("is-menu-locked", open);
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }
}
