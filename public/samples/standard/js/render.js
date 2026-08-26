/* =========================================================
   北斗ルーフ株式会社 サンプルサイト  データ描画スクリプト
   ---------------------------------------------------------
   data/ フォルダの内容を各ページの決まった場所に流し込みます。
   テキストや事例を変更するときは data/*.js を編集してください。
   （このファイルは基本的に触らなくて大丈夫です）
   ========================================================= */
(function () {
  "use strict";

  var C = window.SITE_COMPANY || {};

  /* HTMLエスケープ（データ内の記号を安全に表示するため） */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function tel(raw) { return "tel:" + String(raw || "").replace(/[^0-9+]/g, ""); }

  /* ---------------------------------------------------------
     会社情報のバインド（全ページ共通）
     data-c="キー名" の要素にテキストを流し込みます。
     --------------------------------------------------------- */
  function bindCompany() {
    document.querySelectorAll("[data-c]").forEach(function (el) {
      var key = el.getAttribute("data-c");
      if (C[key] != null && !Array.isArray(C[key])) el.textContent = C[key];
    });
    document.querySelectorAll("[data-c-tel]").forEach(function (a) {
      a.setAttribute("href", tel(C.telLink || C.tel));
      if (a.hasAttribute("data-c-tel-text")) a.textContent = C.tel || "";
    });
    document.querySelectorAll("[data-c-mail]").forEach(function (a) {
      a.setAttribute("href", "mailto:" + (C.email || ""));
      if (a.hasAttribute("data-c-mail-text")) a.textContent = C.email || "";
    });
    // 対応エリア（主要）
    var am = $("#js-area-main");
    if (am && Array.isArray(C.areaMain)) {
      am.innerHTML = C.areaMain.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("");
    }
    var as = $("#js-area-sub");
    if (as && Array.isArray(C.areaSub)) {
      as.innerHTML = C.areaSub.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("");
    }
    var an = $("#js-area-note");
    if (an) an.textContent = C.areaNote || "";
  }

  /* ---------------------------------------------------------
     サービス紹介カード（TOP） #js-services
     --------------------------------------------------------- */
  function renderServices() {
    var box = $("#js-services");
    var data = window.SITE_SERVICES;
    if (!box || !data) return;
    box.innerHTML = data.map(function (s) {
      return '' +
      '<article class="service-card">' +
        '<div class="service-card__img">' +
          '<img src="' + esc(s.image) + '" alt="' + esc(s.name) + 'のイメージ" loading="lazy" width="800" height="600">' +
        '</div>' +
        '<div class="service-card__body">' +
          '<h3>' + esc(s.name) + '</h3>' +
          '<p>' + esc(s.summary) + '</p>' +
          '<a class="service-card__more" href="service.html#' + esc(s.id) + '">くわしく見る</a>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* ---------------------------------------------------------
     サービス詳細（SERVICEページ） #js-service-details
     --------------------------------------------------------- */
  function renderServiceDetails() {
    var box = $("#js-service-details");
    var data = window.SITE_SERVICES;
    if (!box || !data) return;
    box.innerHTML = data.map(function (s, i) {
      var no = String(i + 1).padStart(2, "0");
      return '' +
      '<section class="svc-detail" id="' + esc(s.id) + '">' +
        '<div class="wrap svc-detail__grid">' +
          '<div class="svc-detail__media">' +
            '<img src="' + esc(s.image) + '" alt="' + esc(s.name) + 'の施工イメージ" loading="lazy" width="800" height="600">' +
            '<span class="term-badge">工期目安：' + esc(s.term) + '</span>' +
          '</div>' +
          '<div class="svc-detail__text">' +
            '<h2><span class="no">' + no + '</span>' + esc(s.name) + '</h2>' +
            '<p class="summary">' + esc(s.summary) + '</p>' +
            '<div class="svc-block">' +
              '<h3>よくある症状</h3>' +
              '<ul>' + s.symptoms.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' +
            '</div>' +
            '<div class="svc-block">' +
              '<h3>対応内容</h3>' +
              '<ul>' + s.work.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' +
            '</div>' +
            '<div class="svc-price">' +
              '<div class="label">料金目安（サンプル価格）</div>' +
              '<div class="val">' + esc(s.price) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
    }).join("");
  }

  /* ---------------------------------------------------------
     施工事例カード  #js-works （data-limit="3" で件数制限）
     --------------------------------------------------------- */
  function renderWorks() {
    var box = $("#js-works");
    var data = window.SITE_WORKS;
    if (!box || !data) return;
    var limit = parseInt(box.getAttribute("data-limit"), 10);
    var list = isNaN(limit) ? data : data.slice(0, limit);
    box.innerHTML = list.map(function (w) {
      return '' +
      '<article class="work-card">' +
        '<div class="work-card__ba">' +
          '<figure class="is-before"><img src="' + esc(w.before) + '" alt="' + esc(w.area + " " + w.title) + ' 施工前" loading="lazy" width="900" height="600"><figcaption>BEFORE</figcaption></figure>' +
          '<figure class="is-after"><img src="' + esc(w.after) + '" alt="' + esc(w.area + " " + w.title) + ' 施工後" loading="lazy" width="900" height="600"><figcaption>AFTER</figcaption></figure>' +
        '</div>' +
        '<div class="work-card__body">' +
          '<div class="work-card__tags">' +
            '<span class="tag tag--area">' + esc(w.area) + '</span>' +
            '<span class="tag">' + esc(w.category) + '</span>' +
          '</div>' +
          '<h3>' + esc(w.area) + '｜' + esc(w.title) + '</h3>' +
          '<p class="desc">' + esc(w.desc) + '</p>' +
          '<div class="work-card__meta">' +
            '<span>費用：<b>' + esc(w.cost) + '</b></span>' +
            '<span>工期：<b>' + esc(w.term) + '</b></span>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* ---------------------------------------------------------
     選ばれる理由  #js-reasons
     --------------------------------------------------------- */
  var ICONS = {
    map:    '<path d="M12 2C7.6 2 4 5.6 4 10c0 5.2 7 11.5 7.3 11.8.4.3 1 .3 1.4 0C13 21.5 20 15.2 20 10c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/>',
    search: '<path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/>',
    bolt:   '<path d="M13 2L4.1 13.4c-.4.5 0 1.1.6 1.1H11l-1 8 8.9-11.4c.4-.5 0-1.1-.6-1.1H12l1-8z"/>',
    yen:    '<path d="M12 3l4 7h3v2h-4v2h4v2h-4v3h-2v-3H5v-2h4v-2H5v-2h3L12 3z"/>'
  };
  function renderReasons() {
    var box = $("#js-reasons");
    if (!box || !Array.isArray(C.reasons)) return;
    box.innerHTML = C.reasons.map(function (r, i) {
      return '' +
      '<div class="reason-card">' +
        '<span class="num">POINT ' + String(i + 1).padStart(2, "0") + '</span>' +
        '<div class="ico-wrap"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[r.icon] || ICONS.map) + '</svg></div>' +
        '<h3>' + esc(r.title) + '</h3>' +
        '<p>' + esc(r.desc) + '</p>' +
      '</div>';
    }).join("");
  }

  /* ---------------------------------------------------------
     施工の流れ  #js-flow
     --------------------------------------------------------- */
  function renderFlow() {
    var box = $("#js-flow");
    if (!box || !Array.isArray(C.flow)) return;
    box.innerHTML = C.flow.map(function (f) {
      return '' +
      '<div class="flow-item">' +
        '<span class="step">STEP ' + esc(f.step) + '</span>' +
        '<h3>' + esc(f.title) + '</h3>' +
        '<p>' + esc(f.desc) + '</p>' +
      '</div>';
    }).join("");
  }

  /* ---------------------------------------------------------
     料金目安テーブル  #js-pricing
     --------------------------------------------------------- */
  function renderPricing() {
    var box = $("#js-pricing");
    var data = window.SITE_PRICING;
    if (!box || !data) return;
    box.innerHTML = data.map(function (p) {
      return '<tr><td>' + esc(p.item) + '</td>' +
             '<td class="price">' + esc(p.price) + '</td>' +
             '<td class="note">' + esc(p.note || "") + '</td></tr>';
    }).join("");
  }

  /* ---------------------------------------------------------
     お客様の声  #js-testimonials
     TOPページでは先頭2件を表示（PCで2件横並び／文章を読みやすくするため）。
     件数を増やしたい場合は下の slice(0, 2) の数値を変更してください。
     --------------------------------------------------------- */
  function renderTestimonials() {
    var box = $("#js-testimonials");
    var data = window.SITE_TESTIMONIALS;
    if (!box || !data) return;
    box.innerHTML = data.slice(0, 2).map(function (v) {
      return '' +
      '<figure class="voice-card">' +
        '<span class="work">' + esc(v.work) + '</span>' +
        '<blockquote><p>' + esc(v.text) + '</p></blockquote>' +
        '<figcaption class="name">' + esc(v.name) + '</figcaption>' +
      '</figure>';
    }).join("");
  }

  /* ---------------------------------------------------------
     FAQ アコーディオン  #js-faq
     --------------------------------------------------------- */
  function renderFaq() {
    var box = $("#js-faq");
    var data = window.SITE_FAQ;
    if (!box || !data) return;
    box.innerHTML = data.slice(0, 6).map(function (f, i) {
      var id = "faq-a-" + i;
      return '' +
      '<div class="faq-item">' +
        '<h3 style="margin:0">' +
          '<button class="faq-question" type="button" aria-expanded="false" aria-controls="' + id + '">' + esc(f.q) + '</button>' +
        '</h3>' +
        '<div class="faq-answer" id="' + id + '" role="region"><p>' + esc(f.a) + '</p></div>' +
      '</div>';
    }).join("");
  }

  /* ---------------------------------------------------------
     会社概要テーブル  #js-company-info
     --------------------------------------------------------- */
  function renderCompanyInfo() {
    var box = $("#js-company-info");
    if (!box) return;
    var rows = [
      ["会社名", C.name],
      ["代表者", C.representative],
      ["設立", C.established],
      ["資本金", C.capital],
      ["所在地", (C.postal ? C.postal + "　" : "") + (C.address || "")],
      ["電話番号", C.tel + "（" + (C.telHours || "") + "）"],
      ["メール", C.email],
      ["営業時間", C.businessHours],
      ["定休日", C.closed],
      ["従業員数", C.employees],
      ["建設業許可", C.license],
      ["事業内容", C.business]
    ];
    box.innerHTML = rows.map(function (r) {
      return "<tr><th scope=\"row\">" + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td></tr>";
    }).join("");
  }

  /* ---------------------------------------------------------
     スタッフ紹介  #js-staff
     --------------------------------------------------------- */
  function renderStaff() {
    var box = $("#js-staff");
    if (!box || !Array.isArray(C.staff)) return;
    box.innerHTML = C.staff.map(function (s) {
      return '' +
      '<article class="staff-card">' +
        '<img src="' + esc(s.img) + '" alt="' + esc(s.name) + '（' + esc(s.role) + '）" loading="lazy" width="600" height="600">' +
        '<div class="staff-card__body">' +
          '<span class="role">' + esc(s.role) + '</span>' +
          '<h3>' + esc(s.name) + '</h3>' +
          '<p>' + esc(s.text) + '</p>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  /* 実行 */
  document.addEventListener("DOMContentLoaded", function () {
    bindCompany();
    renderServices();
    renderServiceDetails();
    renderWorks();
    renderReasons();
    renderFlow();
    renderPricing();
    renderTestimonials();
    renderFaq();
    renderCompanyInfo();
    renderStaff();
    // 描画完了を main.js へ知らせる
    document.dispatchEvent(new CustomEvent("content:rendered"));
  });
})();
