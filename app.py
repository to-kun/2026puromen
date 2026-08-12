from flask import Flask, render_template

app = Flask(__name__)

# トップページ（HTMLテンプレートの表示）
@app.route("/")
def index():
    # 変数をHTML側に渡してレンダリング
    return render_template("index.html", title="トップページ", message="こんにちは！")

# ページ追加：アバウトページ（直書きテキストを返す例）
@app.route("/about")
def about():
    return "<h1>アバウトページです</h1><a href='/'>トップへ戻る</a>"

# ページ追加：動的なURLパラメータを受け取る例
@app.route("/user/<username>")
def user_profile(username):
    return f"<h1>{username} さんのマイページ</h1>"

if __name__ == "__main__":
    app.run(debug=True)