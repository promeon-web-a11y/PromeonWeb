/**
 * Swiper カルーセル（将来のお客様の声・実績カード差し替えを想定した器）。
 * [data-carousel] があるときだけ動的 import して初期化する。
 * 現時点ではトップページに該当セクションは無いが、他ページで流用可能。
 */
export async function initCarousels() {
  const nodes = document.querySelectorAll("[data-carousel]");
  if (!nodes.length) return;

  const [{ default: Swiper }, { Autoplay, Pagination, A11y, Keyboard }] = await Promise.all([
    import("swiper"),
    import("swiper/modules"),
  ]);
  await import("swiper/css");
  await import("swiper/css/pagination");

  nodes.forEach((el) => {
    new Swiper(el, {
      modules: [Autoplay, Pagination, A11y, Keyboard],
      slidesPerView: 1.1,
      spaceBetween: 16,
      grabCursor: true,
      keyboard: { enabled: true },
      pagination: { el: el.querySelector("[data-carousel-pagination]"), clickable: true },
      autoplay: { delay: 5000, disableOnInteraction: true },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        960: { slidesPerView: 3, spaceBetween: 24 },
      },
    });
  });
}
