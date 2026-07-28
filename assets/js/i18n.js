/* ==========================================================================
   i18n.js
   日本語 / 英語の切り替え（要件定義書 v1.0 7.5）

   - 日本語は index.html に直書き。英語だけこのファイルの EN 辞書で差し替える
   - 対象は data-i18n="キー" が付いた要素。初回に日本語のinnerHTMLを退避しておき、
     JAに戻すときはそれを復元する
   - 判定順: URLの ?lang=  →  localStorage の保存値  →  ブラウザ言語（日本語以外ならEN）
   - CTAボタン内の矢印SVGは差し替え後に再付与するため、辞書にSVGを書く必要はない

   デバッグ:
     OodannaI18n.set('en')   // 英語に切替
     OodannaI18n.set('ja')   // 日本語に戻す
     OodannaI18n.get()       // 現在の言語
     OodannaI18n.missing()   // 英語訳が無いキーの一覧
   ========================================================================== */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'oodanna-lang';

  /* ------------------------------------------------------------------
     英語辞書
     ------------------------------------------------------------------ */
  var EN = {
    /* --- メタ情報 --- */
    'meta.title': 'Oodanna Tenma Honten | An Osaka izakaya open from noon | Large bottle beer 320 yen',
    'meta.description': 'Steps from JR Tenma Station. A Showa-era izakaya in Osaka open from noon. Pull your own large bottle of beer out of the ice water — 320 yen until 5 pm. Dishes from 190 yen. Cash only.',

    /* --- 共通 / ヘッダー --- */
    'a11y.skip': 'Skip to content',
    'cta.header': 'Book',
    'cta.drawer': 'Reserve a seat (Tabelog)',
    'drawer.concept': '<span>CONCEPT</span>Concept',
    'drawer.feature': '<span>FEATURE</span>Three things',
    'drawer.flow': '<span>HOW TO ENJOY</span>How it works',
    'drawer.menu': '<span>MENU</span>Menu',
    'drawer.voice': '<span>VOICE</span>Reviews',
    'drawer.access': '<span>ACCESS</span>Access',
    'drawer.faq': '<span>FAQ</span>FAQ',
    'more.photos': 'Photos',
    'more.detail': 'Details',

    /* --- 01 ファーストビュー --- */
    'fv.eyebrow': 'TENMA, OSAKA — IZAKAYA',
    'fv.happyhour': 'Large bottle 320 yen, 12:00–17:00',
    'fv.headline': 'Pull it out<br>of the ice.',
    'fv.sub': 'A Showa-era izakaya in Tenma, open from noon.<br>Large bottle beer, <strong>320 yen</strong> until 5 pm.',
    'cta.fv': 'Reserve a seat (Tabelog)',
    'fv.micro.access': 'Steps from JR Tenma Station',
    'fv.micro.cash': 'Cash only',
    'fv.micro.smoke': 'Non-smoking',

    /* --- 02 コンセプト --- */
    'concept.heading': 'A night out<br>in Tenma<br>starts here.',
    'concept.body':
      '<p>Tenma, Osaka. Just off the northern end of<br>' +
      'Japan&rsquo;s longest shopping street, one shop<br>' +
      'has its lights on from noon.</p>' +
      '<p>Everything is made here — the signature dishes<br>' +
      'and the small plates alike. And almost all of it<br>' +
      'costs between 190 and 590 yen.</p>' +
      '<p>The kitchen is wide open. There are no partitions.<br>' +
      'Close enough to bump shoulders with the regular<br>' +
      'next to you, you pull a bottle out of the ice water<br>' +
      'and pour it yourself.</p>' +
      '<p>Nothing here asks you to dress up.<br>' +
      'Start your evening with us.</p>',

    /* --- 03 3本柱 --- */
    'feature.beer.tags': '— ICE WATER × LARGE BOTTLE × 320 YEN —',
    'feature.sakana.tags': '— 43 DISHES × MADE IN HOUSE × FROM 190 YEN —',
    'feature.ba.tags': '— SHOWA × 50 SEATS × NON-SMOKING —',
    'feature.beer.title': 'Pull your own out of the ice.',
    'feature.beer.body':
      '<p>Nobody brings your beer to the table.<br>' +
      'You reach into the ice water and pull out<br>' +
      'a large bottle yourself.</p>' +
      '<p>Sunk deep in ice, the bottle is cold enough to hurt.<br>' +
      'White mist rises the moment you pop the cap.<br>' +
      'Poured into a glass, the head comes up fine and tight.</p>' +
      '<p>Some people come all the way to Tenma just for this one glass.</p>',
    'price.label': 'Large bottle beer',
    'price.was': 'Regular 530 yen',
    'price.unit': ' yen',
    'feature.beer.loss': 'One minute past 5 pm and every bottle costs 210 yen more.',
    'cta.feature': 'Make it before 5 pm',

    'feature.sakana.title': 'From 190 yen, all made in house.',
    'feature.sakana.body':
      '<p>43 dishes. Almost all of them are 190 to 590 yen.</p>' +
      '<p>Cheap does not mean cut corners.<br>' +
      'Prep is done here, every day. The seasoning runs bold,<br>' +
      'because it is built to go with a drink.</p>' +
      '<p>The signature is <em>nikudofu</em> — &ldquo;black tofu&rdquo; — at 693 yen.<br>' +
      'Tofu and beef simmered until they look almost black.<br>' +
      'Some regulars come for nothing else.</p>' +
      '<p>There is sashimi too.<br>' +
      'A seven-kind platter of fresh fish for 1,628 yen.<br>' +
      'Most people are surprised at least once<br>' +
      'that sashimi at this price looks like this.</p>',

    'feature.ba.title': 'Showa Japan, still standing.',
    'feature.ba.body':
      '<p>20 counter seats, 30 table seats. 50 in all.<br>' +
      'No private rooms. No partitions.</p>' +
      '<p>The kitchen is wide open. You hear the grill,<br>' +
      'and you hear the orders being called.</p>' +
      '<p>At noon, while it is still bright outside,<br>' +
      'the counter is sometimes already full.<br>' +
      'That is what Tenma is like.</p>' +
      '<p>One person or ten.<br>' +
      'The whole place is non-smoking, so there is no haze.</p>',

    /* --- 04 来店3ステップ --- */
    'flow.heading': 'First time? You&rsquo;ll settle in within three minutes.',
    'flow.step1.title': 'Take a seat',
    'flow.step1.desc': 'No reservation needed.<br>On your own? Head for the counter.<br>&ldquo;Sumimasen&rdquo; is enough to get started.',
    'flow.step2.title': 'Pull up a beer',
    'flow.step2.desc': 'One large bottle from the ice water.<br>Openers are right there.<br>320 yen if it&rsquo;s before 5 pm.',
    'flow.step3.title': 'Order some food',
    'flow.step3.desc': 'Start with nikudofu, ham katsu and sashimi.<br>When in doubt, those three never miss.',
    'flow.note.cash': 'Cash only',
    'flow.note.smoke': 'Non-smoking throughout',
    'flow.note.room': 'No private rooms or buyouts',

    /* --- 05 メニュー --- */
    'menu.heading': 'Menu',
    'menu.lead': '43 dishes and 35 drinks.<br>Almost everything is 190 to 590 yen.',
    'menu.pick.heading': 'Start with these three',
    'menu.nikudofu.name': 'Nikudofu (black tofu)',
    'menu.nikudofu.price': '693 yen',
    'menu.nikudofu.desc': 'Simmered until it looks almost black. Our signature.',
    'menu.hamukatsu.name': 'Unzen thick-cut ham katsu',
    'menu.hamukatsu.price': '550 yen [TBD]',
    'menu.hamukatsu.desc': 'The kind of ham katsu that wins on thickness alone.',
    'menu.otsukuri.name': 'Sashimi platter (7 kinds)',
    'menu.otsukuri.price': '1,628 yen',
    'menu.otsukuri.desc': 'The plate that makes people ask, &ldquo;at this price?&rdquo;',
    'menu.other.heading': 'More dishes',
    'menu.other.1': 'Black vinegar pork with mashed potato',
    'menu.other.2': 'Potato salad with shuto',
    'menu.other.3': 'Namafu with butter',
    'menu.other.4': 'Robatayaki skewers',
    'menu.drink.heading': 'Drinks',
    'drink.bottle.name': 'Large bottle beer',
    'drink.bottle.price': '320 yen<small>12:00-17:00 / regular 530 yen</small>',
    'drink.sake.name': 'Local sake',
    'drink.sake.price': 'from 528 yen',
    'drink.other.name': 'Draft beer, highball, chuhai, shochu, wine',
    'drink.other.price': '35 kinds',
    'menu.note':
      'Prices include tax. [TBD: tax-inclusive / exclusive to be confirmed]<br>' +
      'The menu changes with what comes in that day.<br>' +
      'Payment is cash only.',
    'cta.menu': 'Drink at these prices → Book',

    /* --- 06 数字 --- */
    'proof.heading': 'The numbers say<br>why people pick us.',
    'proof.unit.people': '',
    'proof.label.saves': 'saves on Tabelog',
    'proof.unit.reviews': '',
    'proof.label.reviews': 'reviews',
    'proof.unit.rating': '',
    'proof.label.rating': 'Tabelog rating',
    'proof.unit.seats': '',
    'proof.label.seats': 'seats (counter 20 / tables 30)',
    'proof.unit.price': ' yen+',
    'proof.label.price': 'typical price of a dish',
    'proof.label.open': 'is when we open',
    'proof.note': 'Figures as listed on Tabelog, [TBD: month] 2026. [TBD: update to the latest values before launch]',

    /* --- 07 口コミ --- */
    'voice.heading': 'From 580 reviews.',
    'voice.placeholder':
      '[TBD: review quotes] Three to five real Tabelog reviews will go here.<br>' +
      'They will be added once the source is credited, the text is left unedited,<br>' +
      'and the client confirms the quotes may be published.',
    'cta.voice': 'See why 580 people wrote in',

    /* --- 08 Instagram --- */
    'sns.heading': 'See the shop as it is,<br>on Instagram.',
    'sns.cta': 'View on Instagram',

    /* --- 09 アクセス --- */
    'access.heading': 'Shop information',
    'access.th.name': 'Name',
    'access.td.name': 'Oodanna Tenma Honten',
    'access.th.address': 'Address',
    'access.td.address': '5-7-3 Tenjinbashi, Kita-ku, Osaka',
    'access.th.route': 'Getting here',
    'access.td.route':
      'Steps from JR Tenma Station (162 m)<br>' +
      '5 min walk from Osaka Metro Ogimachi Station<br>' +
      '5 min walk from Osaka Metro Tenjinbashisuji 6-chome Station',
    'access.th.tel': 'Phone',
    'access.td.tel': '<a href="tel:+81663573366" data-tel>+81 6-6357-3366</a><small>We do not take reservations by phone.</small>',
    'access.th.hours': 'Hours',
    'access.td.hours': '12:00&ndash;23:00<br><small>(L.O. food 22:00 / drinks 22:30)</small>',
    'access.th.closed': 'Closed',
    'access.td.closed': 'Irregular holidays',
    'access.th.seats': 'Seats',
    'access.td.seats': '50 (counter 20 / tables 30)',
    'access.th.rooms': 'Private rooms',
    'access.td.rooms': 'None',
    'access.th.smoking': 'Smoking',
    'access.td.smoking': 'Non-smoking throughout',
    'access.th.payment': 'Payment',
    'access.td.payment': 'Cash only (no cards, e-money or QR payments)',
    'access.th.parking': 'Parking',
    'access.td.parking': 'None (coin parking nearby)',
    'access.th.reserve': 'Reservations',
    'access.td.reserve': 'Online via Tabelog<br><small>(we do not take reservations by phone)</small>',
    'access.alert':
      '<strong>Cash only</strong>' +
      'Credit cards, e-money and QR code payments are not accepted. There are ATMs nearby.',
    'map.button': 'Show the map',
    'map.note': '5-7-3 Tenjinbashi, Kita-ku, Osaka<br>(click to load Google Maps)',
    'map.link': 'Open in Google Maps →',
    'cta.access': 'Pick a date and book',

    /* --- 10 FAQ --- */
    'faq.heading': 'Frequently asked questions',
    'faq.q1': 'Do I need a reservation?',
    'faq.a1': 'You are welcome without one. Evenings often fill up, so if you want to be sure of a seat, we recommend booking online through Tabelog.',
    'faq.q2': 'Can I come on my own?',
    'faq.a2': 'Of course. There are 20 counter seats, and plenty of our guests come alone.',
    'faq.q3': 'Do you take credit cards?',
    'faq.a3': 'Sorry — payment is cash only. There are ATMs nearby.',
    'faq.q4': 'How much should I expect to spend?',
    'faq.a4': 'Around 2,000 to 3,000 yen per person. Most dishes are 190 to 590 yen, and a large bottle of beer is 320 yen until 5 pm.',
    'faq.q5': 'What time do you open?',
    'faq.a5': 'We are open straight through from 12:00 to 23:00. You can drink from noon.',
    'faq.q6': 'Are there private rooms?',
    'faq.a6': 'No private rooms and no buyouts. Every seat is on one open floor.',
    'faq.q7': 'Can I smoke?',
    'faq.a7': 'The whole shop is non-smoking.',
    'faq.q8': 'How large a group can you take?',
    'faq.a8': 'From 1 to 10 people. [TBD: maximum group size to be confirmed]',
    'faq.q9': 'Is there an English menu?',
    'faq.a9': '[TBD: to be confirmed with the shop — including whether there is a menu with photos]',

    /* --- 12 フッター / 追従バー --- */
    'footer.info':
      '5-7-3 Tenjinbashi, Kita-ku, Osaka<br>' +
      '<a href="tel:+81663573366" data-tel>+81 6-6357-3366</a><br>' +
      '12:00&ndash;23:00 / irregular holidays / non-smoking / cash only',
    'cta.footer': 'Reserve a seat (Tabelog)',
    'sticky.sub': 'Large bottle 320 yen until 5 pm',
    'cta.sticky': 'Book'
  };

  /* aria-label など、テキストノード以外の英語化 */
  var EN_ARIA = {
    '.p-burger': 'Open the menu',
    '#map-load': 'Load Google Maps',
    '.p-header__nav': 'Main navigation'
  };

  /* ------------------------------------------------------------------
     内部処理
     ------------------------------------------------------------------ */
  var current = 'ja';
  var originals = null;   // key -> 日本語のinnerHTML
  var originalAria = {};
  var listeners = [];

  function snapshot() {
    if (originals) return;
    originals = {};
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute('data-i18n');
      if (!(k in originals)) originals[k] = nodes[i].innerHTML;
    }
    for (var sel in EN_ARIA) {
      var el = document.querySelector(sel);
      if (el) originalAria[sel] = el.getAttribute('aria-label');
    }
  }

  function applyTo(el, html) {
    // CTAボタンの矢印SVGは退避してから戻す
    var arrow = el.querySelector('.c-btn__arrow');
    el.innerHTML = html;
    if (arrow) el.appendChild(arrow);
  }

  function apply(lang) {
    snapshot();
    var toEn = (lang === 'en');
    var nodes = document.querySelectorAll('[data-i18n]');

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (toEn) {
        if (Object.prototype.hasOwnProperty.call(EN, key)) applyTo(el, EN[key]);
      } else if (originals && key in originals) {
        applyTo(el, originals[key]);
      }
      // 数字タイルの単位（カウントアップが使う data-suffix）も合わせる
      if (el.hasAttribute('data-i18n-suffix')) {
        // 単位spanは別キーで差し替わるため、ここでは何もしない
      }
    }

    // カウントアップ用の data-suffix を言語に合わせる
    var counters = document.querySelectorAll('[data-count][data-i18n-suffix]');
    for (var c = 0; c < counters.length; c++) {
      var cell = counters[c];
      if (toEn) {
        if (!cell.hasAttribute('data-suffix-ja')) {
          cell.setAttribute('data-suffix-ja', cell.getAttribute('data-suffix') || '');
        }
        cell.setAttribute('data-suffix', cell.getAttribute('data-i18n-suffix') || '');
      } else if (cell.hasAttribute('data-suffix-ja')) {
        cell.setAttribute('data-suffix', cell.getAttribute('data-suffix-ja'));
      }
    }

    // aria-label
    for (var sel in EN_ARIA) {
      var target = document.querySelector(sel);
      if (!target) continue;
      if (toEn) target.setAttribute('aria-label', EN_ARIA[sel]);
      else if (originalAria[sel]) target.setAttribute('aria-label', originalAria[sel]);
    }

    // <html lang> とメタ情報
    document.documentElement.setAttribute('lang', toEn ? 'en' : 'ja');
    if (toEn) {
      if (!document.documentElement.dataset.titleJa) {
        document.documentElement.dataset.titleJa = document.title;
        var dsc = document.querySelector('meta[name="description"]');
        document.documentElement.dataset.descJa = dsc ? dsc.getAttribute('content') : '';
      }
      document.title = EN['meta.title'];
      var d1 = document.querySelector('meta[name="description"]');
      if (d1) d1.setAttribute('content', EN['meta.description']);
    } else if (document.documentElement.dataset.titleJa) {
      document.title = document.documentElement.dataset.titleJa;
      var d2 = document.querySelector('meta[name="description"]');
      if (d2) d2.setAttribute('content', document.documentElement.dataset.descJa);
    }

    // 切替ボタンの状態
    var buttons = document.querySelectorAll('.p-lang [data-lang]');
    for (var b = 0; b < buttons.length; b++) {
      var isCurrent = buttons[b].getAttribute('data-lang') === lang;
      buttons[b].setAttribute('aria-current', isCurrent ? 'true' : 'false');
    }

    current = lang;

    // ハッピーアワーの動的文言を書き直させる
    if (global.OodannaHappyHour && typeof global.OodannaHappyHour.render === 'function') {
      global.OodannaHappyHour.render();
    }
    for (var l = 0; l < listeners.length; l++) {
      try { listeners[l](lang); } catch (e) { /* noop */ }
    }
  }

  function detect() {
    try {
      var q = new RegExp('[?&]lang=(ja|en)').exec(global.location.search);
      if (q) return q[1];
      var saved = global.localStorage ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved === 'ja' || saved === 'en') return saved;
      var nav = (navigator.language || 'ja').toLowerCase();
      return nav.indexOf('ja') === 0 ? 'ja' : 'en';
    } catch (e) {
      return 'ja';
    }
  }

  function set(lang, persist) {
    if (lang !== 'ja' && lang !== 'en') return;
    apply(lang);
    if (persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* noop */ }
    }
  }

  function init() {
    snapshot();
    apply(detect());

    var buttons = document.querySelectorAll('.p-lang [data-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        set(this.getAttribute('data-lang'));
      });
    }
  }

  global.OodannaI18n = {
    get: function () { return current; },
    set: function (lang) { set(lang); },
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    /** 英語訳が無いキーを一覧する（訳し忘れ検出用） */
    missing: function () {
      var out = [];
      var nodes = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        var k = nodes[i].getAttribute('data-i18n');
        if (!Object.prototype.hasOwnProperty.call(EN, k) && out.indexOf(k) === -1) out.push(k);
      }
      return out;
    },
    dict: EN
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
