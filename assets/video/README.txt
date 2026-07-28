ここに FV 用の動画を配置してください。

必要なファイル:
  hero-dobuzuke.mp4   （H.264 / 6-10秒 / 無音 / 1.5MB以下）
  hero-dobuzuke.webm  （VP9 / 同上）

素材: Instagram のどぶ漬けリール
  https://www.instagram.com/reel/DamlAbluynL/
  ※ 店舗自身が撮影・投稿したものであることを確認してから使用すること（要件書 8.4）

変換コマンド例（ffmpeg）:
  ffmpeg -i source.mp4 -t 8 -an -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-dobuzuke.mp4
  ffmpeg -i source.mp4 -t 8 -an -vf "scale=1280:-2" -c:v libvpx-vp9 -crf 36 -b:v 0 hero-dobuzuke.webm

ファイルを置くだけで index.html の <video> が再生します（HTML の編集は不要）。
動画が無い間は assets/img/hero-poster の静止画が表示されます。
