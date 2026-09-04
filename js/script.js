/* Promeon Web サイト共通スクリプト（外部ライブラリ・フレームワーク不使用）
   - キャッチコピー先行型の導入演出（FV：縦書きキャッチを1文字ずつ時間差で出現 → CTA追従）
   - ハンバーガーメニュー全画面展開
   - スクロール連動フェードイン（順次出現型 / [data-stagger] / prefers-reduced-motion 配慮）
   - 制作サンプルの「見え隠れ型」表示（双方向トグル）
   - よくある質問のアコーディオン開閉（高さトランジション）
   - お問い合わせフォームのダミー送信（表示確認用）
   - ヘッダーの影付与（スクロール時） / フッター年号の自動表示 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- キャッチコピー先行型（FV／TOPのみ） ----------
     .hero-catch 内テキストを1文字ずつ <span class="cc"> で包み、
     1文字あたり約100msの時間差でフェード＋下→上スライドで出現させる。 */
  var hero = document.querySelector('.hero');
  var catchEl = document.querySelector('.hero-catch');

  function splitCatch(el) {
    var text = (el.textContent || '').trim();
    el.textContent = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'cc';
      span.textContent = text[i];
      frag.appendChild(span);
    }
    el.appendChild(frag);
    return el.querySelectorAll('.cc');
  }

  if (hero && catchEl) {
    // 万一この演出処理でエラーが出ても、キャッチが不可視のまま残らないよう
    // try/catch で保護し、失敗時は即座に表示状態（is-in）へフォールバックする。
    try {
      var chars = splitCatch(catchEl);
      var perChar = 0.1; // 1文字あたりの間隔（秒）
      var baseDelay = 0.35; // キャッチ開始までの間

      if (reduceMotion) {
        hero.classList.add('is-in');
      } else {
        chars.forEach(function (c, i) {
          c.style.transitionDelay = (baseDelay + i * perChar) + 's';
        });
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { hero.classList.add('is-in'); });
        });
      }
    } catch (err) {
      hero.classList.add('is-in');
    }
  }

  /* ---------- ハンバーガーメニュー（全画面展開） ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var siteNav = document.getElementById('siteNav');

  function closeMenu() {
    if (!siteNav) return;
    siteNav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'メニューを開く');
    }
  }
  function openMenu() {
    siteNav.classList.add('is-open');
    document.body.classList.add('nav-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'メニューを閉じる');
  }
  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', function () {
      if (siteNav.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1199) closeMenu();
    });
  }

  /* ---------- 順次出現型フェードイン ---------- */
  var staggerGroups = document.querySelectorAll('[data-stagger]');
  staggerGroups.forEach(function (group) {
    var items = group.querySelectorAll('.reveal');
    items.forEach(function (el, i) { el.style.transitionDelay = (i * 0.1) + 's'; });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 見え隠れ型（制作サンプルのプレビュー） ---------- */
  var peekEls = document.querySelectorAll('.peek');
  if (peekEls.length) {
    if (reduceMotion || !hasIO) {
      peekEls.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-in', entry.isIntersecting);
        });
      }, { threshold: 0.18, rootMargin: '-6% 0px -6% 0px' });
      peekEls.forEach(function (el) { pio.observe(el); });
    }
  }

  /* ---------- よくある質問：アコーディオン開閉 ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- お問い合わせフォーム（ダミー送信） ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (status) {
        status.className = 'form-status is-show is-ok';
        status.textContent = 'お問い合わせ内容を受け付けました（この画面は表示確認用サンプルのため、実際には送信されません）。内容を確認のうえ、担当者よりご連絡いたします。';
        status.setAttribute('tabindex', '-1');
        status.focus();
      }
      form.reset();
    });
  }

  /* ---------- ヘッダーの影（スクロール時） ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- フッター年号 ---------- */
  var y = document.getElementById('copyYear');
  if (y) y.textContent = new Date().getFullYear();
})();
