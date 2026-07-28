FV（ファーストビュー）背景の動画置き場です。

■ 現在置いているもの
  hero-dobuzuke.mp4   6.6MB / 25秒 / H.264 / 音声なし
  （元ファイル: IMG_3813.MOV をそのままリネームして配置）

■ 要件定義書（7.3・8.2）との差分【要対応】
  要件         : 6〜10秒 / 1.5MB以下 / mp4 + webm の2形式
  現在         : 25秒 / 6.6MB / mp4のみ
  → 4倍以上重い状態です。変換ツール（ffmpeg等）が用意でき次第、
     下記コマンドで圧縮・トリミングしてから差し替えてください。

■ 現状の対策
  - モバイル（〜767px）では動画を読み込まず、静止画のみを表示
  - PCでもページ表示が終わってから動画の読み込みを開始（LCPは静止画で確定）
  - prefers-reduced-motion 有効時は読み込まない

■ 圧縮・トリミングのコマンド例（ffmpeg）
  # 良いところ8秒を切り出して圧縮（-ss は開始秒、-t は長さ）
  ffmpeg -i IMG_3813.MOV -ss 3 -t 8 -an -vf "scale=1280:-2" \
         -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-dobuzuke.mp4

  # webm版（あるとFirefox等で軽くなる）
  ffmpeg -i IMG_3813.MOV -ss 3 -t 8 -an -vf "scale=1280:-2" \
         -c:v libvpx-vp9 -crf 36 -b:v 0 hero-dobuzuke.webm

  webm を置いた場合は index.html の <video> の data-src に加えて、
  assets/js/main.js の startVideo() に webm の <source> を追加してください。

■ 差し替え方
  同じファイル名 hero-dobuzuke.mp4 で上書きするだけです。HTMLの編集は不要です。
  動画が無い場合は assets/img/hero-poster.jpg が表示されます。

■ 権利確認（要件書8.4）
  店舗自身が撮影・投稿した素材であることを確認のうえ使用してください。
