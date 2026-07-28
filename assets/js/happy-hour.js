/* ==========================================================================
   happy-hour.js
   ハッピーアワー（12:00-17:00 / 大瓶320円）残り時間カウンター
   要件定義書 v1.0 5章-01・追従CTAバー準拠

   - 判定は必ず Asia/Tokyo 基準（閲覧者の端末TZに依存しない）
   - 1分ごとに更新（次の「毎分00秒」に揃えて更新する）
   - JSが無効／例外時は HTML の静的文言をそのまま残す（上書きしない）

   デバッグ:
     OodannaHappyHour.setDebugTime('16:58')            // 時刻を注入
     OodannaHappyHour.setDebugTime('2026-07-28T23:10') // 日付付きでも可
     OodannaHappyHour.clearDebugTime()                 // 実時刻に戻す
     OodannaHappyHour.getState()                       // 現在の判定結果を確認
   ========================================================================== */
(function (global) {
  'use strict';

  var OPEN_MIN  = 12 * 60; // 12:00 開店
  var HAPPY_END = 17 * 60; // 17:00 ハッピーアワー終了
  var LO_MIN    = 22 * 60; // 22:00 料理L.O.
  var CLOSE_MIN = 23 * 60; // 23:00 閉店

  var debugMinutes = null; // 注入された時刻（0-1439）。null なら実時刻
  var timerId = null;
  var listeners = [];

  /** Asia/Tokyo の「その日の経過分」を返す */
  function tokyoMinutes() {
    if (debugMinutes !== null) return debugMinutes;
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(new Date());
      var h = 0, m = 0;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'hour')   h = parseInt(parts[i].value, 10);
        if (parts[i].type === 'minute') m = parseInt(parts[i].value, 10);
      }
      if (h === 24) h = 0; // 一部環境で 24 が返るケースへの保険
      return h * 60 + m;
    } catch (e) {
      // Intl 非対応環境: 端末ローカル時刻にフォールバック
      var d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }

  /** 分数を「◯時間◯分」表記に */
  function formatRemain(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    if (h > 0 && m > 0) return h + '時間' + m + '分';
    if (h > 0) return h + '時間';
    return m + '分';
  }

  /**
   * 現在の状態を返す
   * state: 'happy' | 'open' | 'lastorder' | 'closed' | 'before'
   */
  function getState(minutesOverride) {
    var now = (typeof minutesOverride === 'number') ? minutesOverride : tokyoMinutes();
    var remain = HAPPY_END - now;

    // 12:00 - 17:00 … ハッピーアワー中
    if (now >= OPEN_MIN && now < HAPPY_END) {
      return {
        state: 'happy',
        minutes: now,
        remaining: remain,
        fvLabel: '大瓶320円 あと ',
        fvTime: formatRemain(remain),
        stickyMain: '320円タイム あと' + formatRemain(remain),
        stickySub: '大瓶ビール 通常530円 → 320円'
      };
    }

    // 17:00 - 22:00 … 営業中（320円は終了）
    if (now >= HAPPY_END && now < LO_MIN) {
      return {
        state: 'closed',
        minutes: now,
        remaining: 0,
        fvLabel: '本日の320円は終了。明日12:00から',
        fvTime: '',
        stickyMain: '営業中 〜23:00',
        stickySub: '大瓶320円は明日12:00から'
      };
    }

    // 22:00 - 23:00 … まもなくL.O.
    if (now >= LO_MIN && now < CLOSE_MIN) {
      return {
        state: 'lastorder',
        minutes: now,
        remaining: 0,
        fvLabel: '本日の320円は終了。明日12:00から',
        fvTime: '',
        stickyMain: 'まもなくL.O.',
        stickySub: '料理22:00 / ドリンク22:30'
      };
    }

    // 23:00 - 翌12:00 … 閉店中
    return {
      state: 'before',
      minutes: now,
      remaining: 0,
      fvLabel: '本日12:00オープン',
      fvTime: '',
      stickyMain: '本日12:00オープン',
      stickySub: '大瓶ビールは12:00-17:00が320円'
    };
  }

  /** DOMへ反映 */
  function render() {
    var s;
    try {
      s = getState();
    } catch (e) {
      return; // 静的文言のままにしておく（フォールバック）
    }

    // --- FVのバッジ ---
    var fv = document.getElementById('hh-fv');
    if (fv) {
      var text = fv.querySelector('.p-hh__text');
      if (text) {
        if (s.fvTime) {
          text.innerHTML = '';
          text.appendChild(document.createTextNode(s.fvLabel));
          var strong = document.createElement('span');
          strong.className = 'p-hh__time';
          strong.textContent = s.fvTime;
          text.appendChild(strong);
        } else {
          text.textContent = s.fvLabel;
        }
      }
      fv.setAttribute('data-state', s.state);
    }

    // --- 追従バーのステータス ---
    var st = document.getElementById('sticky-status');
    if (st) {
      var main = st.querySelector('strong');
      var sub = st.querySelector('.p-sticky__status-sub');
      if (main) main.textContent = s.stickyMain;
      if (sub) sub.textContent = s.stickySub;
      st.setAttribute('data-state', s.state);
    }

    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](s); } catch (e) { /* noop */ }
    }
  }

  /** 次の毎分00秒に合わせて更新をスケジュール */
  function scheduleNextTick() {
    if (timerId) clearTimeout(timerId);
    var msToNextMinute = 60000 - (Date.now() % 60000);
    timerId = setTimeout(function () {
      render();
      scheduleNextTick();
    }, msToNextMinute + 50);
  }

  function start() {
    render();
    scheduleNextTick();
  }

  var api = {
    getState: getState,
    render: render,
    start: start,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
    /** '16:58' / '2026-07-28T16:58' / 分数(0-1439) を受け付ける */
    setDebugTime: function (value) {
      if (typeof value === 'number') {
        debugMinutes = ((value % 1440) + 1440) % 1440;
      } else if (typeof value === 'string') {
        var m = value.match(/(\d{1,2}):(\d{2})/);
        if (!m) { throw new Error('setDebugTime: "HH:mm" 形式で指定してください'); }
        debugMinutes = (parseInt(m[1], 10) % 24) * 60 + parseInt(m[2], 10);
      } else {
        throw new Error('setDebugTime: 不正な値です');
      }
      render();
      return getState();
    },
    clearDebugTime: function () {
      debugMinutes = null;
      render();
      return getState();
    },
    /** 単体確認用: 4つの時間帯すべての判定結果をまとめて返す */
    selfTest: function () {
      return ['11:59', '12:00', '16:59', '17:00', '21:59', '22:00', '22:59', '23:00', '03:00']
        .map(function (t) {
          var mm = t.split(':');
          var s = getState(parseInt(mm[0], 10) * 60 + parseInt(mm[1], 10));
          return { time: t, state: s.state, fv: s.fvLabel + s.fvTime, sticky: s.stickyMain };
        });
    }
  };

  global.OodannaHappyHour = api;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
