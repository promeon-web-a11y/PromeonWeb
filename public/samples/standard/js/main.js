/* =========================================================
   北斗ルーフ株式会社 サンプルサイト  共通スクリプト
   ---------------------------------------------------------
   ・スマホ用ハンバーガーメニューの開閉
   ・よくある質問（FAQ）のアコーディオン開閉
   ・お問い合わせフォームのダミー送信
   ・フッターの西暦を自動表示
   外部ライブラリは使用していません。
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- ハンバーガーメニュー ---------- */
    var menuBtn = document.getElementById("menuBtn");
    var nav = document.getElementById("siteNav");

    function closeMenu() {
      if (!nav) return;
      nav.classList.remove("is-open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    }

    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      // メニュー内リンクをタップしたら閉じる
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeMenu);
      });
      // Escキーで閉じる
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
      // 画面幅を広げたら状態をリセット
      window.addEventListener("resize", function () {
        if (window.innerWidth > 640) closeMenu();
      });
    }

    /* ---------- FAQアコーディオン（イベント委譲） ----------
       FAQは render.js が後から生成することがあるため、
       document 側でクリックを受け取ります。
       -------------------------------------------------- */
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-question");
      if (!btn) return;
      var item = btn.closest(".faq-item");
      if (!item) return;
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* ---------- お問い合わせフォーム（ダミー送信） ----------
       このサンプルにはサーバー機能がないため、送信は行われません。
       実運用時は README.md の「問い合わせ先の変更方法」を参照し、
       フォーム送信サービスや自社サーバーの処理に置き換えてください。
       -------------------------------------------------- */
    var form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = document.getElementById("formMsg");
        if (msg) {
          msg.classList.add("is-visible");
          msg.setAttribute("tabindex", "-1");
          msg.focus();
          msg.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      });
    }

    /* ---------- フッターの西暦 ---------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

  });
})();
