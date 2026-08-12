# Webサイト型異変探しゲーム

一般的な企業Webサイトを模したUI上で「異変（アノマリー）」を探す、8番出口風のブラウザゲームです。
プレイヤーはページ内を注意深く観察し、異変の有無を判断して進退を選択します。

---

## 🛠 システム概要

Flaskを用いて開発し、`Frozen-Flask` で静的HTML/CSS/JSにビルドした上で **GitHub Pages** にて公開・動作させています。
ゲームの進行度や異変の発動判定などのロジックは、すべてクライアントサイド（JavaScript）上でリアルタイムに処理されます。

---

## 📁 ディレクトリ・ファイル構成

```text
puromen/
├── app.py              # Flaskアプリケーション本体（開発・確認用）
├── freeze.py           # Frozen-Flask静的ビルドスクリプト
├── requirements.txt    # 依存ライブラリ一覧
├── static/             # 静的アセット
│   ├── css/
│   │   └── style.css   # 通常スタイルおよび異変専用CSSクラス
│   ├── js/
│   │   ├── main.js     # エントリーポイント・初期化処理
│   │   ├── gameLogic.js# 進行管理・判定・状態遷移
│   │   └── anomalies.js# 異変データ定義・発動処理
│   ├── images/         # ロゴ・Webサイト用画像データ
│   └── audio/          # 効果音・BGMデータ
├── templates/          # Jinja2 テンプレート
│   └── index.html      # メイン画面構造
└── docs/               # GitHub Pages公開用ビルド出力先
