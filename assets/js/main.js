/* ==========================================================================
   main.js
   ヘッダー / ドロワー / スクロールアニメ / カウントアップ /
   追従CTAバー / 地図クリック・トゥ・ロード / GA4計測
   要件定義書 v1.0 6.4・7.3・7.6 準拠
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     0. 設定
     ------------------------------------------------------------------ */
  // TBD: GA4 測定ID。クライアントから受領後にここだけ差し替える。
  //      プレースホルダーのままの場合、gtag.js は読み込まず dataLayer への push のみ行う
  //      （公開前でもイベント発火を DevTools > dataLayer で検証できる）。
  var GA4_ID = 'G-XXXXXXXXXX';

  // モバイルではFV動画を読み込まず静止画にフォールバックする（要件書 7.3・データ通信量への配慮）
  var DISABLE_VIDEO_ON_MOBILE = true;

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. GA4
     ------------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  var gaEnabled = /^G-[A-Z0-9]{6,}$/.test(GA4_ID) && GA4_ID !== 'G-XXXXXXXXXX';
  if (gaEnabled) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(gs);
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }

  /** カスタムイベント送信（GA4未設定でも dataLayer には必ず積む） */
  function track(name, params) {
    var payload = params || {};
    if (gaEnabled) {
      gtag('event', name, payload);
    } else {
      window.dataLayer.push(Object.assign({ event: name }, payload));
    }
  }
  window.oodannaTrack = track; // 動作確認用

  /* ------------------------------------------------------------------
     2. ヘッダー / ドロワー
     ------------------------------------------------------------------ */
  var header = document.querySelector('.p-header');
  var burger = document.querySelector('.p-burger');
  var drawer = document.getElementById('drawer');

  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /** ハンバーガーのラベルは表示言語に合わせる */
  function burgerLabel(open) {
    var en = document.documentElement.getAttribute('lang') === 'en';
    if (en) return open ? 'Close the menu' : 'Open the menu';
    return open ? 'メニューを閉じる' : 'メニューを開く';
  }

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', burgerLabel(false));
    document.body.style.overflow = '';
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      if (open) {
        closeDrawer();
      } else {
        drawer.classList.add('is-open');
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', burgerLabel(true));
        document.body.style.overflow = 'hidden';
      }
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ------------------------------------------------------------------
     3. スクロールインアニメーション
     ------------------------------------------------------------------ */
  var reveals = document.querySelectorAll('.js-reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-inview'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) { revealIO.observe(el); });
  }

  /* ------------------------------------------------------------------
     4. 数字のカウントアップ
     ------------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count]');

  function formatNumber(value, decimals) {
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString('ja-JP');
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;

    function frame(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = formatNumber(target * eased, decimals) +
        (suffix ? '<span>' + suffix + '</span>' : '');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length && !prefersReduced && 'IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(counters, function (el) { countIO.observe(el); });
  }
  // reduced-motion / 非対応時は HTML に書かれた最終値がそのまま表示される

  /* ------------------------------------------------------------------
     5. 追従CTAバー（モバイルのみ・スクロール80vh以降）
     ------------------------------------------------------------------ */
  var sticky = document.getElementById('sticky');
  if (sticky) {
    var isDesktop = function () { return window.innerWidth >= 1024; };
    var onScrollSticky = function () {
      if (isDesktop()) {
        sticky.classList.remove('is-visible');
        sticky.setAttribute('aria-hidden', 'true');
        return;
      }
      var show = window.scrollY > window.innerHeight * 0.8;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    window.addEventListener('scroll', onScrollSticky, { passive: true });
    window.addEventListener('resize', onScrollSticky);
    onScrollSticky();
  }

  /* ------------------------------------------------------------------
     6. FV動画（reduced-motion / モバイル対応）
     ------------------------------------------------------------------ */
  var fvVideo = document.getElementById('fv-video');
  if (fvVideo) {
    var isMobile = window.innerWidth < 768;
    if (prefersReduced || (DISABLE_VIDEO_ON_MOBILE && isMobile)) {
      // 動画を読み込まず、poster / 背景画像の静止画で見せる
      fvVideo.removeAttribute('autoplay');
      fvVideo.pause();
      while (fvVideo.firstChild) fvVideo.removeChild(fvVideo.firstChild);
      fvVideo.load();
    } else {
      var playAttempt = fvVideo.play();
      // catch は予約語のためブラケット記法で呼ぶ（古いパーサ対策）
      if (playAttempt && typeof playAttempt['catch'] === 'function') {
        playAttempt['catch'](function () { /* 自動再生ブロック時は poster を表示 */ });
      }
    }
  }

  /* ------------------------------------------------------------------
     7. 地図（クリック・トゥ・ロード）
     ------------------------------------------------------------------ */
  var mapBtn = document.getElementById('map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.google.com/maps?q=' +
        encodeURIComponent('大阪府大阪市北区天神橋5-7-3 大旦那 天満本店') +
        '&hl=ja&z=17&output=embed';
      iframe.loading = 'lazy';
      iframe.title = '大旦那 天満本店の地図';
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      iframe.allowFullscreen = true;
      var wrap = document.getElementById('map');
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
      track('click_map', { method: 'embed' });
    });
  }

  /* ------------------------------------------------------------------
     8. 計測イベント（要件書 7.6）
     ------------------------------------------------------------------ */
  // 8-1〜8-4. クリック計測はイベント委譲で拾う。
  // 言語切替で innerHTML を差し替えてもリスナーが外れないようにするため、
  // 個別要素ではなく document で受ける。
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var cta = t.closest('[data-cta]');
    if (cta) track('click_reserve', { location: cta.getAttribute('data-cta') });

    if (t.closest('[data-instagram]')) track('click_instagram', {});
    if (t.closest('[data-map-link]')) track('click_map', { method: 'link' });
    if (t.closest('[data-tel]')) track('click_tel', {});
  });

  // 8-5. scroll_depth（25 / 50 / 75 / 100）
  var depths = [25, 50, 75, 100];
  var firedDepths = {};
  var onScrollDepth = function () {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var percent = (window.scrollY / scrollable) * 100;
    depths.forEach(function (d) {
      if (!firedDepths[d] && percent >= d - 0.5) {
        firedDepths[d] = true;
        track('scroll_depth', { percent: d });
      }
    });
  };
  window.addEventListener('scroll', onScrollDepth, { passive: true });
  onScrollDepth();

  // 8-6. view_section（各セクションの50%表示）
  if ('IntersectionObserver' in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          track('view_section', { section_id: entry.target.id });
          sectionIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('section[id], footer[id]').forEach(function (sec) {
      sectionIO.observe(sec);
    });
  }

  // 8-7. faq_open
  document.querySelectorAll('.p-faq__item').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        var q = item.querySelector('summary');
        track('faq_open', { question: q ? q.textContent.trim() : '' });
      }
    });
  });
})();
