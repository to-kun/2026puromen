from flask_frozen import Freezer
from app import app

app.config['FREEZER_DESTINATION'] = 'docs'

freezer = Freezer(app)

# 動的ルート（/user/<username>）のためのパラメータを指定
@freezer.register_generator
def user_profile():
    # 静的HTMLとして出力したいユーザー名のリストを返す
    yield {'username': 'guest'}

# 404エラーが発生してもビルドを中断せずに無視する設定（開発中の場合）
app.config['FREEZER_IGNORE_404_NOT_FOUND'] = True
app.config['FREEZER_RELATIVE_URLS'] = True

if __name__ == "__main__":
    freezer.freeze()