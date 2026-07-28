/* ==========================================================================
   instagram.js
   Instagram 公式埋め込みの遅延読み込み
   要件定義書 v1.0 5章-08 / 7.3 準拠

   - 初期ロードに embed.js を含めない（LCP対策）
   - #ig-embeds がビューポートに入った時点で blockquote を生成し、
     その後に //www.instagram.com/embed.js を注入する
   - 表示する投稿URLは HTML の data-ig-posts にカンマ区切りで記述する
   ========================================================================== */
(function () {
  'use strict';

  var container = document.getElementById('ig-embeds');
  if (!container) return;

  var raw = container.getAttribute('data-ig-posts') || '';
  var urls = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!urls.length) return;

  var loaded = false;

  function buildBlockquotes() {
    urls.forEach(function (url) {
      var bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', url);
      bq.setAttribute('data-instgrm-version', '14');
      bq.style.background = '#1F1A16';
      bq.style.border = '0';
      bq.style.margin = '0 auto';
      bq.style.maxWidth = '540px';
      bq.style.width = '100%';
      bq.style.minHeight = '360px';

      // embed.js が読めなかった場合でも投稿へ辿れるようにしておく
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Instagramの投稿を見る';
      a.style.display = 'block';
      a.style.padding = '24px';
      a.style.color = '#D8A24A';
      a.style.fontSize = '14px';
      bq.appendChild(a);

      container.appendChild(bq);
    });
  }

  function injectScript() {
    if (document.getElementById('ig-embed-script')) {
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
      return;
    }
    var s = document.createElement('script');
    s.id = 'ig-embed-script';
    s.async = true;
    s.defer = true;
    s.src = 'https://www.instagram.com/embed.js';
    s.onload = function () {
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    };
    s.onerror = function () {
      var p = document.createElement('p');
      p.className = 'p-sns__fallback';
      p.innerHTML = '投稿を読み込めませんでした。' +
        '<a href="https://www.instagram.com/oodanna_tenma/" target="_blank" rel="noopener noreferrer">Instagramで見る</a>';
      container.appendChild(p);
    };
    document.body.appendChild(s);
  }

  function load() {
    if (loaded) return;
    loaded = true;
    buildBlockquotes();
    injectScript();
  }

  if (!('IntersectionObserver' in window)) {
    // 非対応環境: スクロール時に一度だけ読む
    var onScroll = function () {
      var rect = container.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.5) {
        load();
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        load();
        io.disconnect();
      }
    });
  }, { rootMargin: '300px 0px' });

  io.observe(container);
})();
