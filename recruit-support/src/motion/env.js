// モーション環境の判定を一箇所に集約する。

const mq =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false, addEventListener() {} };

/** モーション低減が要求されているか */
export const prefersReducedMotion = () => mq.matches;

/**
 * 設定変更時にページを一度リロードして状態を作り直す（実装をシンプルに保つ）。
 * 初回登録時は何もしない。
 */
export function watchMotionPreference() {
  mq.addEventListener?.("change", () => {
    document.documentElement.classList.toggle("reduce-motion", mq.matches);
  });
  document.documentElement.classList.toggle("reduce-motion", mq.matches);
}
