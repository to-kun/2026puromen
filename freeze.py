from flask_frozen import Freezer
from app import app

freezer = Freezer(app)

# 動的ルート（/user/<username>）のためのパラメータを指定
@freezer.register_generator
def user_profile():
    # 静的HTMLとして出力したいユーザー名のリストを返す
    yield {'username': 'guest'}

if __name__ == "__main__":
    freezer.freeze()