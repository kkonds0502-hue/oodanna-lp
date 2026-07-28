# 大旦那 天満本店 ランディングページ

要件定義書 v1.0（`oodanna-lp-requirements_1.md`）に基づく実装。
素の HTML / CSS / JavaScript。ビルドツール不要。

---

## 1. ディレクトリ構成

```
oodanna-lp/
├── index.html                  ← 本体（全セクション・構造化データ・OGP）
├── assets/
│   ├── css/style.css           ← デザイントークン + 全スタイル
│   ├── js/
│   │   ├── main.js             ← ヘッダー / アニメ / 追従バー / 地図 / GA4
│   │   ├── happy-hour.js       ← ハッピーアワー残り時間カウンター
│   │   └── instagram.js        ← Instagram埋め込みの遅延読込
│   ├── img/*.svg               ← プレースホルダー画像（差し替え対象）
│   └── video/                  ← FV動画を置く場所（README.txt 参照）
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

ローカル確認は `index.html` をブラウザで開くだけで動きます
（Instagram埋め込みとGoogleフォントのみネット接続が必要）。

---

## 2. 素材の差し替え手順

### 2-1. 画像

提供素材（`大旦那写真` フォルダ）から選定・リサイズした **JPEG** を配置済みです。

| ファイル名 | 内容 | 出力サイズ | 元ファイル | 撮影地 |
|---|---|---|---|---|
| `hero-poster.jpg` | 氷水の大瓶（FV背景） | 1536×864 | `03_007.jpg` | 商品撮影 |
| `og-image.jpg` | OGP | 1200×630 | `03_007.jpg` | 商品撮影 |
| `feature-beer-01.jpg` | 氷水に沈む大瓶 | 1440×1080 | `03_007.jpg` | 商品撮影 |
| `feature-beer-02.jpg` | 瓶を引き上げるスタッフ | 1200×800 | `241206_..._038.jpg` | **KITTE店** |
| `feature-beer-03.jpg` | 氷水の大瓶アップ | 1200×800 | `LINE_..._1.jpg` | 商品撮影 |
| `feature-sakana-01.jpg` | 肉豆腐（黒ドーフ） | 1440×1080 | `0H6A5675.jpg` | 商品撮影 |
| `feature-sakana-02.jpg` | 鮮魚お造り | 1200×800 | `0H6A5690.jpg` | 商品撮影 |
| `feature-sakana-03.jpg` | 雲仙厚切りハムカツ | 1200×800 | `03_005.jpg` | 商品撮影 |
| `feature-ba-01.jpg` | 店内全景 | 1440×1080 | `241206_..._001.jpg` | **KITTE店** |
| `feature-ba-02.jpg` | 大旦那の看板 | 1200×800 | `LINE_..._74.jpg` | **KITTE店** |
| `feature-ba-03.jpg` | 赤提灯 | 1200×800 | `241206_..._012.jpg` | **KITTE店** |
| `menu-01-nikudofu.jpg` | 肉豆腐 | 800×800 | `0H6A5717.jpg` | 商品撮影 |
| `menu-02-hamukatsu.jpg` | ハムカツ | 800×800 | `03_005.jpg` | 商品撮影 |
| `menu-03-otsukuri.jpg` | お造り | 800×800 | `0H6A5690.jpg` | 商品撮影 |

> ⚠️ **KITTE店** と記した5枚は別店舗の写真です。天満本店の店内・外観写真が用意でき次第、
> 同じファイル名で差し替えてください（HTMLの編集は不要）。要件書1.3・6.1が指摘するとおり、
> LPと現地体験のギャップは口コミ低評価の主因になります。

### 2-1-2. WebP化（未実施 / 推奨）

この環境に変換ツールが無かったため **JPEG（品質82）** で書き出しています。
WebP化すると転送量が3〜4割減ります。ツールを入れたら下記を実行し、
`index.html` の `.jpg` → `.webp` を一括置換してください。

```bash
# ImageMagick
magick mogrify -format webp -quality 80 -path assets/img assets/img/*.jpg

# cwebp（単体）
cwebp -q 80 assets/img/feature-beer-01.jpg -o assets/img/feature-beer-01.webp
```

`index.html` の `<img>` には実寸の `width` / `height` を明記済みです（CLS対策）。
**差し替え後に縦横比が変わる場合は属性値も更新してください。**

### 2-2. FV動画

`assets/video/README.txt` を参照。`hero-dobuzuke.mp4` / `.webm` を置くだけで再生されます。

### 2-3. 権利確認（要件書 8.4）

Instagramの写真・動画をダウンロードして掲載する場合、**店舗自身の撮影・投稿であることを必ず確認**してください。
第三者投稿のリポストは無断使用にあたります。確認が取れないカットは、
Instagram公式の埋め込み（本LPの `#sns` セクション）で表示すれば権利上クリーンです。

---

## 3. 文言・数値の更新箇所

| 内容 | 場所 |
|---|---|
| 食べログの数値（保存数・口コミ数・評点） | `index.html` `#proof` の `data-count` 属性と表示テキスト（各1行）＋直下の取得時期の注記 |
| ハッピーアワーの時間帯・価格 | `assets/js/happy-hour.js` 冒頭の `OPEN_MIN` / `HAPPY_END` / `LO_MIN` / `CLOSE_MIN`、および `index.html` の `#feature` 価格ブロック |
| メニュー・価格 | `index.html` `#menu` |
| 店舗情報 | `index.html` `#access` のテーブル ＋ ページ先頭の JSON-LD（`Restaurant`）の2箇所 |
| FAQ | `index.html` `#faq` ＋ ページ先頭の JSON-LD（`FAQPage`）の2箇所。**必ず両方を同じ内容に保つこと** |
| GA4 測定ID | `assets/js/main.js` 冒頭の `GA4_ID` |
| 公開ドメイン | `index.html`（canonical / og:url / og:image / JSON-LD）、`robots.txt`、`sitemap.xml` |
| Instagram投稿 | `index.html` `#sns` の `data-ig-posts`（カンマ区切りで追加） |

---

## 4. ハッピーアワーカウンターの動作確認

ブラウザのコンソールで時刻を注入して4つの時間帯を確認できます。

```js
OodannaHappyHour.setDebugTime('12:00');  // → 「大瓶330円 あと5時間」
OodannaHappyHour.setDebugTime('16:58');  // → 「大瓶330円 あと2分」
OodannaHappyHour.setDebugTime('17:00');  // → 「本日の330円は終了。明日12:00から」
OodannaHappyHour.setDebugTime('22:10');  // → 追従バー「まもなくL.O.」
OodannaHappyHour.setDebugTime('03:00');  // → 「本日12:00オープン」
OodannaHappyHour.clearDebugTime();       // 実時刻に戻す

console.table(OodannaHappyHour.selfTest()); // 全時間帯の判定を一覧表示
```

判定は閲覧者の端末タイムゾーンによらず **Asia/Tokyo 基準**です（`Intl.DateTimeFormat` 使用）。
JSが無効・例外時は HTML に書かれた静的文言「12:00〜17:00は大瓶330円」が残ります。

---

## 5. GA4 の確認

`main.js` の `GA4_ID` がプレースホルダー（`G-XXXXXXXXXX`）の間は **gtag.js を読み込まず**、
イベントは `window.dataLayer` に push されるだけになります。公開前でも下記で発火を検証できます。

```js
dataLayer.filter(e => e.event);   // 発火したイベント一覧
```

測定IDを設定すると自動で gtag.js が読み込まれ、GA4 に送信されます。

| イベント | 発火条件 | パラメータ |
|---|---|---|
| `click_reserve` | 食べログCTAのクリック | `location` = header / drawer / fv / feature / menu / voice / access / footer / footer-link / sticky |
| `click_instagram` | Instagramリンク | — |
| `click_map` | 地図の読込・マップリンク | `method` = embed / link |
| `click_tel` | 電話番号タップ | — |
| `scroll_depth` | 25 / 50 / 75 / 100% 到達 | `percent` |
| `view_section` | 各セクション50%表示 | `section_id` |
| `faq_open` | FAQ展開 | `question` |

---

## 6. 公開手順

### Netlify / Vercel（推奨）

1. `oodanna-lp/` フォルダをそのままドラッグ&ドロップ（Netlify Drop）
   もしくは Git リポジトリを接続（ビルドコマンドなし・公開ディレクトリ = ルート）
2. 独自ドメインを設定（HTTPSは自動）
3. `index.html` の canonical / og:url、`robots.txt`、`sitemap.xml` のドメインを差し替えて再デプロイ
4. Google Search Console にサイトマップを登録

### レンタルサーバー

`oodanna-lp/` の中身をそのまま公開ディレクトリへFTPアップロード。サーバー要件はありません。

### 公開前チェック

- [ ] `【TBD】` の全箇所を確定値に差し替えた（`index.html` を "TBD" で検索）
- [ ] 画像・動画を本番素材に差し替えた
- [ ] ドメインを差し替えた（canonical / og:url / og:image / JSON-LD / robots / sitemap）
- [ ] GA4 測定IDを設定した
- [ ] 食べログの数値を最新に更新し、取得年月を注記した
- [ ] PageSpeed Insights（モバイル）を実行した

---

## 7. 未実装・保留（クライアント確認待ち）

| 項目 | 状態 |
|---|---|
| 口コミセクション `#voice` | 引用文の創作を避けるため、プレースホルダーとCTAのみ。実口コミの選定と掲載可否確認後に差し込み |
| 採用セクション `#recruit` | 掲載可否未確認のため、`index.html` 内にコメントアウトで待機 |
| メニュー一部価格 | `【TBD】` 表記のまま |
| 営業時間 | 食べログとホットペッパーで情報差異あり。要件書3章の確定値（12:00〜23:00通し）を採用 |
| 英語版 | 第2弾。`data-i18n` キーと非表示の言語切替ボタンを先行実装済み |
