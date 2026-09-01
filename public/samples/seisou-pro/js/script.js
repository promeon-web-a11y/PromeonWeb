/* クリーンサポート札幌（架空）｜Proプラン 製品サンプル 共通スクリプト
   ・ハンバーガーメニューの開閉（スマホ）／リンク選択で自動的に閉じる
   ・画面幅がPCに戻ったらメニュー状態をリセット
   ・施工事例（works.html）のカテゴリ絞り込みタブ
   ・お問い合わせフォームの必須項目・メール形式チェック（送信はダミー）
   ・フッターの年号を自動表示
*/
(function () {
  'use strict';

  /* ---------- ハンバーガーメニュー ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'メニューを開く');
    }
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) closeNav();
  });

  /* ---------- 施工事例のカテゴリ絞り込みタブ ---------- */
  var tabWrap = document.getElementById('worksFilter');
  if (tabWrap) {
    var buttons = tabWrap.querySelectorAll('.tab-btn');
    var cards = document.querySelectorAll('.js-case');
    tabWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab-btn');
      if (!btn) return;
      var filter = btn.getAttribute('data-filter');
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category') || '';
        var show = filter === 'all' || cat === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* ---------- お問い合わせフォーム（表示確認用サンプル：送信されません） ---------- */
  var form = document.getElementById('contactForm');
  var msg = document.getElementById('formMsg');

  function setError(field, text) {
    var holder = field.closest('.form-field');
    if (!holder) return;
    var err = holder.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      holder.appendChild(err);
    }
    err.textContent = text || '';
    field.setAttribute('aria-invalid', text ? 'true' : 'false');
    field.style.borderColor = text ? '#c9501d' : '';
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;

      form.querySelectorAll('[required]').forEach(function (field) {
        var val = field.value.trim();
        if (!val) {
          ok = false;
          setError(field, '入力してください。');
          if (!firstBad) firstBad = field;
        } else {
          setError(field, '');
        }
      });

      var email = form.querySelector('#cf-email');
      if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        ok = false;
        setError(email, 'メールアドレスの形式をご確認ください。');
        if (!firstBad) firstBad = email;
      }

      if (msg) {
        msg.hidden = false;
        msg.className = 'form-msg ' + (ok ? 'is-ok' : 'is-ng');
        msg.textContent = ok
          ? 'ご入力ありがとうございます。こちらはProプランの製品サンプルのため、実際の送信は行われません。お急ぎの場合はお電話（0120-000-000）でご連絡ください。'
          : '未入力・誤りのある項目があります。赤色の表示をご確認ください。';
      }

      if (ok) {
        form.reset();
      } else if (firstBad) {
        firstBad.focus();
      }
    });
  }

  /* ---------- フッターの年号 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
